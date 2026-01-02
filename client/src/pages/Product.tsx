import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { Favorite, FavoriteBorder, WhatsApp, ShoppingBag } from '@mui/icons-material'
import api from '../api/axios'
import useCart from '../store/cart'
import { useAuth } from '../context/AuthContext'
import ImageGallery from '../components/ImageGallery'
import Tabs from '../components/Tabs'
import RelatedProducts from '../components/RelatedProducts'
import { ReviewsList, ReviewForm } from '../components/Reviews'
import toast from 'react-hot-toast'
import { useTrackProductView } from '../components/RecentlyViewed'
import RecentlyViewed from '../components/RecentlyViewed'

export default function Product() {
  const { slug } = useParams()
  const { data, isLoading } = useQuery(
    ['product', slug],
    async () => {
      const res = await api.get(`/products/${slug}`)
      return res.data.product
    },
    { enabled: !!slug }
  )

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const cart = useCart()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: wishlistData } = useQuery(
    ['wishlist'],
    async () => {
      const res = await api.get('/wishlist')
      return res.data.items || []
    },
    { enabled: !!user }
  )

  const isInWishlist = wishlistData?.some((item: any) => item.productId === data?.id)

  const wishlistMutation = useMutation(
    () =>
      isInWishlist
        ? api.delete(`/wishlist/${data.id}`)
        : api.post('/wishlist', { productId: data.id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist'])
        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist')
      },
      onError: () => {
        toast.error('Failed to update wishlist')
      },
    }
  )

  useTrackProductView(data?.id)

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  const addToCart = () => {
    const vId = selectedVariant || data.variants?.[0]?.id
    if (!vId) return
    cart.add({ variantId: vId, quantity: 1 })
    toast.success('Added to cart!')
  }

  const buyNow = () => {
    const vId = selectedVariant || data.variants?.[0]?.id
    if (!vId) return
    // Navigate to checkout with this item directly
    navigate('/checkout', {
      state: {
        buyNowItem: { variantId: vId, quantity: 1 }
      }
    })
  }

  const selectedVariantData =
    data.variants?.find((v: any) => v.id === selectedVariant) || data.variants?.[0]
  const finalPrice = selectedVariantData
    ? (selectedVariantData.price - (selectedVariantData.discount || 0)) / 100
    : 0
  const originalPrice = selectedVariantData ? selectedVariantData.price / 100 : 0
  const hasDiscount = selectedVariantData && selectedVariantData.discount && selectedVariantData.discount > 0

  const tabs = [
    {
      id: 'desc',
      title: 'Description',
      content: (
        <Box>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            {data.description}
          </Typography>
          {data.category && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Category:{' '}
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {data.category.name}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'pricing',
      title: 'Pricing',
      content: (
        <Stack spacing={2}>
          {data.variants?.map((v: any) => {
            const price = (v.price - (v.discount || 0)) / 100
            const original = v.price / 100
            const discount = v.discount || 0
            return (
              <Paper key={v.id} sx={{ p: 2, '&:hover': { bgcolor: 'grey.50' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {v.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {v.sku} • Stock: {v.stock > 0 ? `${v.stock} available` : 'Out of stock'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {discount > 0 ? (
                      <Box>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          ₵{price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ₵{original.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Save ₵{(discount / 100).toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        ₵{price.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            )
          })}
        </Stack>
      ),
    },
    {
      id: 'packages',
      title: 'Packages & Pricing',
      content: (
        <Box>
          {data.pricingPackaging && (
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
              {data.pricingPackaging}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mb: 3 }}>
            {!data.pricingPackaging && 'Choose from our available package sizes to suit your needs:'}
            {data.pricingPackaging && data.variants?.length > 0 && 'Available sizes:'}
          </Typography>
          <Grid container spacing={2}>
            {data.variants?.map((v: any) => {
              const price = (v.price - (v.discount || 0)) / 100
              return (
                <Grid item xs={12} sm={6} key={v.id}>
                  <Paper sx={{ p: 3, '&:hover': { boxShadow: 4 } }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {v.name}
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
                      ₵{price.toFixed(2)}
                    </Typography>
                    {v.discount && v.discount > 0 && (
                      <Typography variant="body2" color="error" gutterBottom>
                        Save ₵{(v.discount / 100).toFixed(2)}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      SKU: {v.sku}
                    </Typography>
                    <Typography variant="body2" color={v.stock > 0 ? 'success.main' : 'error.main'} sx={{ mt: 1 }}>
                      {v.stock > 0 ? `✓ In Stock (${v.stock} available)` : '✗ Out of Stock'}
                    </Typography>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      ),
    },
    {
      id: 'howto',
      title: 'How to Use',
      content: (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Usage Instructions
          </Typography>
          {data.howToUse ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {data.howToUse}
            </Typography>
          ) : (
            <List component="ol" sx={{ listStyle: 'decimal', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Cleanse your skin thoroughly before application" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Apply a small amount to the affected area" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Gently massage in circular motions until absorbed" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Use twice daily (morning and evening) for best results" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Store in a cool, dry place away from direct sunlight" />
              </ListItem>
            </List>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Note:</strong> If you experience any irritation, discontinue use and consult a dermatologist.
          </Alert>
        </Box>
      ),
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      content: (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Product Composition
          </Typography>
          {data.ingredients ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {data.ingredients}
            </Typography>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                This product contains carefully selected ingredients for optimal skin care:
              </Typography>
              <List component="ul" sx={{ listStyle: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', pl: 1 }}>
                  <ListItemText primary="Natural botanical extracts" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', pl: 1 }}>
                  <ListItemText primary="Vitamin E for skin nourishment" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', pl: 1 }}>
                  <ListItemText primary="Hyaluronic acid for hydration" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', pl: 1 }}>
                  <ListItemText primary="Gentle, non-comedogenic formula" />
                </ListItem>
              </List>
            </>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Allergen Information:</strong> Please check the product label for a complete list of ingredients.
            If you have known allergies, consult with a healthcare professional before use.
          </Alert>
        </Box>
      ),
    },
    {
      id: 'faqs',
      title: 'FAQs',
      content: (
        <Stack spacing={3}>
          {data.faq && (() => {
            try {
              const faqs = JSON.parse(data.faq)
              if (Array.isArray(faqs) && faqs.length > 0) {
                return faqs.map((faq: any, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <Divider />}
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {faq.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </Box>
                  </React.Fragment>
                ))
              }
              return null
            } catch {
              return null
            }
          })() || (
            <>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  How long does shipping take?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We deliver within 1-3 business days across Ghana. Delivery times may vary based on your location.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Is this product suitable for all skin types?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This product is formulated for most skin types. However, if you have sensitive skin or known allergies,
                  we recommend doing a patch test first or consulting with a dermatologist.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Can I return this product?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! We offer a money-back guarantee. If you're not satisfied with your purchase, you can return it
                  within 30 days for a full refund.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  What payment methods do you accept?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We accept Cash on Delivery (COD). You pay when you receive your order.
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  How should I store this product?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Store in a cool, dry place away from direct sunlight. Keep the cap tightly closed when not in use.
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      ),
    },
    {
      id: 'delivery',
      title: 'Delivery & Returns',
      content: (
        <Stack spacing={3}>
          {data.deliveryReturns ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {data.deliveryReturns}
            </Typography>
          ) : (
            <>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Delivery Information
                </Typography>
                <List component="ul" sx={{ listStyle: 'disc', pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Free delivery within 1-3 business days across Ghana" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Cash on Delivery (COD) available" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="We'll contact you before delivery to confirm your address" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Delivery times may vary during holidays or peak seasons" />
                  </ListItem>
                </List>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Returns Policy
                </Typography>
                <List component="ul" sx={{ listStyle: 'disc', pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="30-day money-back guarantee" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Products must be unopened and in original packaging" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Contact us via WhatsApp or email to initiate a return" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Refunds will be processed within 5-7 business days" />
                  </ListItem>
                </List>
              </Box>
            </>
          )}
          <Alert severity="success">
            <strong>Need Help?</strong> Contact us via WhatsApp at {process.env.REACT_APP_WHATSAPP_NUMBER} or email us
            for assistance with delivery or returns.
          </Alert>
        </Stack>
      ),
    },
    {
      id: 'guarantee',
      title: 'Money-Back Guarantee',
      content: (
        <Stack spacing={3}>
          {data.eligibleForReturn !== false ? (
            <>
              <Alert severity="info">
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  100% Satisfaction Guarantee
                </Typography>
                <Typography variant="body2">
                  We stand behind the quality of our products. If you're not completely satisfied, we'll make it right.
                </Typography>
              </Alert>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  What's Covered
                </Typography>
                <List component="ul" sx={{ listStyle: 'disc', pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Full refund within 30 days of purchase" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Products that don't meet your expectations" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Defective or damaged items" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Wrong items received" />
                  </ListItem>
                </List>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  How to Claim
                </Typography>
                <List component="ol" sx={{ listStyle: 'decimal', pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Contact us via WhatsApp or email within 30 days" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Provide your order number and reason for return" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="We'll arrange for product return (if applicable)" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Receive your full refund within 5-7 business days" />
                  </ListItem>
                </List>
              </Box>
              {data.moneyBackGuarantee && (
                <Alert severity="success">
                  <strong>This product is covered by our Money-Back Guarantee!</strong>
                </Alert>
              )}
            </>
          ) : (
            <>
              <Alert severity="warning">
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  This Product is Not Returnable
                </Typography>
                <Typography variant="body2">
                  This product is not eligible for returns or refunds. Please review the product details carefully before making your purchase.
                </Typography>
              </Alert>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Important Information
                </Typography>
                <List component="ul" sx={{ listStyle: 'disc', pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="This item cannot be returned or exchanged" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="No refunds will be issued for this product" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Please ensure this product meets your needs before purchasing" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', pl: 1 }}>
                    <ListItemText primary="Contact us if you have any questions before placing your order" />
                  </ListItem>
                </List>
              </Box>
              {data.moneyBackGuarantee && (
                <Alert severity="info">
                  <strong>Note:</strong> While this product has a money-back guarantee badge, it is marked as non-returnable. Please contact customer service for clarification if needed.
                </Alert>
              )}
            </>
          )}
        </Stack>
      ),
    },
  ]

  const whatsappMessage = encodeURIComponent(
    `Hi, I'd like to order ${data.name} - Packages: ${data.variants
      ?.map((v: any) => v.name + '(' + v.id + ')')
      .join(', ')}`
  )

  return (
    <Box>
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ImageGallery images={data.images || []} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {data.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {data.brand?.name && (
              <Typography variant="body2" color="text.secondary" component="span">
                Brand: {data.brand.name}
              </Typography>
            )}
            {data.category && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
                Category: {data.category.name}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {data.isNew && <Chip label="New" color="primary" size="small" />}
            {data.isBestSeller && <Chip label="Best Seller" color="warning" size="small" />}
            {data.moneyBackGuarantee && <Chip label="Money-Back Guarantee" color="success" size="small" />}
          </Stack>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="variant-select-label">Select Package</InputLabel>
            <Select
              labelId="variant-select-label"
              value={selectedVariant || ''}
              label="Select Package"
              onChange={(e) => setSelectedVariant(e.target.value as string)}
            >
              {data.variants?.map((v: any) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name} — ₵{(v.price / 100).toFixed(2)}
                  {v.discount && v.discount > 0 && ` (Save ₵${(v.discount / 100).toFixed(2)})`}
                  {v.stock <= 0 && ' — Out of Stock'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedVariantData && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                {hasDiscount ? (
                  <>
                    <Typography variant="h3" color="primary" fontWeight={700}>
                      ₵{finalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ₵{originalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="error" fontWeight={500}>
                      Save ₵{((selectedVariantData.discount || 0) / 100).toFixed(2)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    ₵{finalPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                color={selectedVariantData.stock > 0 ? 'success.main' : 'error.main'}
              >
                {selectedVariantData.stock > 0
                  ? `✓ In Stock (${selectedVariantData.stock} available)`
                  : '✗ Out of Stock'}
              </Typography>
            </Paper>
          )}

          <Stack spacing={2} sx={{ mt: 3 }}>
            {/* Buy Now Button - Primary Action */}
            <Button
              onClick={buyNow}
              disabled={!selectedVariantData || selectedVariantData.stock <= 0}
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              startIcon={<ShoppingBag />}
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
            >
              Buy Now
            </Button>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={addToCart}
                disabled={!selectedVariantData || selectedVariantData.stock <= 0}
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
              >
                Add to Cart
              </Button>
              {user && (
                <IconButton
                  onClick={() => wishlistMutation.mutate()}
                  color={isInWishlist ? 'error' : 'default'}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  sx={{
                    bgcolor: isInWishlist ? 'error.light' : 'grey.100',
                    '&:hover': {
                      bgcolor: isInWishlist ? 'error.main' : 'grey.200',
                    },
                  }}
                >
                  {isInWishlist ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}
            </Stack>

            <Button
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="success"
              fullWidth
              size="large"
              startIcon={<WhatsApp />}
            >
              Order via WhatsApp
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Tabs tabs={tabs} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Reviews
        </Typography>
        <ReviewsList slug={slug as string} />
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight={500}>
            Write a review
          </Typography>
          <ReviewForm slug={slug as string} />
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <RelatedProducts productId={data.id} categorySlug={data.category?.slug} />
      </Box>

      <Box>
        <RecentlyViewed />
      </Box>
    </Box>
  )
}
