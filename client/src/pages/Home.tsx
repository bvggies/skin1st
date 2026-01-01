import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Paper,
  Divider,
} from '@mui/material'
import {
  ShoppingBag,
  LocalShipping,
  Security,
  Favorite,
  Star,
  ArrowForward,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import api from '../api/axios'
import SkeletonCard from '../components/SkeletonCard'
import Newsletter from '../components/Newsletter'

export default function Home() {
  const { data: categories } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: featured, isLoading: featuredLoading, error: featuredError } = useQuery(
    ['products', 'featured'],
    async () => {
      const res = await api.get('/products?perPage=8')
      return res.data.products || []
    },
    {
      onError: (error: any) => {
        console.error('Error fetching featured products:', error)
      }
    }
  )

  const { data: bestSellers, isLoading: bestSellersLoading, error: bestSellersError } = useQuery(
    ['products', 'bestsellers'],
    async () => {
      const res = await api.get('/products?perPage=4')
      const products = res.data.products || []
      return products.filter((p: any) => p.isBestSeller).slice(0, 4)
    },
    {
      onError: (error: any) => {
        console.error('Error fetching best sellers:', error)
      }
    }
  )

  const { data: newProducts, isLoading: newProductsLoading, error: newProductsError } = useQuery(
    ['products', 'new'],
    async () => {
      const res = await api.get('/products?perPage=4')
      const products = res.data.products || []
      return products.filter((p: any) => p.isNew).slice(0, 4)
    },
    {
      onError: (error: any) => {
        console.error('Error fetching new products:', error)
      }
    }
  )

  const ProductCard = ({ product }: { product: any }) => {
    const minPrice = product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v: any) => v.price - (v.discount || 0)))
      : 0
    const maxPrice = product.variants && product.variants.length > 0
      ? Math.max(...product.variants.map((v: any) => v.price - (v.discount || 0)))
      : 0
    const hasDiscount = product.variants?.some((v: any) => v.discount > 0)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'visible',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="280"
              image={product.images?.[0]?.url || 'https://placehold.co/400x300'}
              alt={product.name}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {product.isNew && (
                <Chip
                  label="New"
                  size="small"
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              )}
              {product.isBestSeller && (
                <Chip
                  label="Best Seller"
                  size="small"
                  sx={{
                    bgcolor: '#f59e0b',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
            <IconButton
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f3f4f6',
                },
              }}
            >
              <Favorite fontSize="small" />
            </IconButton>
            {hasDiscount && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: '#ef4444',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Sale
              </Box>
            )}
          </Box>
          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontSize: '0.875rem' }}
            >
              {product.brand?.name}
            </Typography>
            <Typography
              variant="h6"
              component={Link}
              to={`/product/${product.slug}`}
              sx={{
                fontWeight: 600,
                mb: 1,
                textDecoration: 'none',
                color: 'text.primary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {product.name}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  sx={{
                    fontSize: '1rem',
                    color: star <= 4 ? '#fbbf24' : '#e5e7eb',
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {minPrice > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    ₵{(minPrice / 100).toFixed(2)}
                  </Typography>
                  {maxPrice > minPrice && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      ₵{(maxPrice / 100).toFixed(2)}
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const CategoryCard = ({ category }: { category: any }) => (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        component={Link}
        to={`/shop?category=${category.slug}`}
        sx={{
          textAlign: 'center',
          p: 3,
          textDecoration: 'none',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ShoppingBag sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
          {category.name}
        </Typography>
      </Card>
    </motion.div>
  )

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight={800}
                  gutterBottom
                  sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}
                >
                  Premium Beauty & Skin Therapy
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}
                >
                  Discover our curated collection of premium beauty products. 
                  Quality you can trust, delivered to your door.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={Link}
                    to="/shop"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                      },
                    }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I want to order')}`}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"
                    alt="Beauty Products"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {[
            { icon: <LocalShipping />, title: 'Free Delivery', desc: '1-3 days delivery' },
            { icon: <Security />, title: 'Secure Payment', desc: 'Cash on delivery' },
            { icon: <Favorite />, title: 'Money Back', desc: '100% guarantee' },
          ].map((feature, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <Box sx={{ bgcolor: 'grey.50', py: 8, mb: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Shop by Category
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explore our wide range of beauty categories
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {categories.slice(0, 6).map((category: any) => (
                <Grid item xs={6} sm={4} md={2} key={category.id}>
                  <CategoryCard category={category} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Featured Products Section - Show all products if no best sellers */}
      {featured && featured.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Featured Products
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Discover our collection
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/shop"
              variant="outlined"
              endIcon={<ArrowForward />}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>
          {featuredLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {featured.slice(0, 8).map((p: any) => (
                <Grid item xs={6} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}

      {/* Best Sellers Section */}
      {bestSellers && bestSellers.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Best Sellers
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our most popular products
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/shop"
              variant="outlined"
              endIcon={<ArrowForward />}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>
          {bestSellersLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {bestSellers.map((p: any) => (
                <Grid item xs={6} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}

      {/* Special Offer Banner */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          mb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
                Special Offer
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Get 20% off on your first order. Use code: FIRST20
              </Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                  },
                }}
              >
                Shop Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* New Arrivals Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              New Arrivals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Latest additions to our collection
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/shop"
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>
        {newProductsError ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">Error loading products. Please try again later.</Typography>
          </Box>
        ) : newProductsLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={6} md={3} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : newProducts && newProducts.length > 0 ? (
          <Grid container spacing={3}>
            {newProducts.map((p: any) => (
              <Grid item xs={6} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No new arrivals yet. Check out all products in our shop!</Typography>
            <Button component={Link} to="/shop" variant="contained" sx={{ mt: 2 }}>
              Browse All Products
            </Button>
          </Box>
        )}
      </Container>

      {/* Newsletter Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Newsletter />
        </Container>
      </Box>
    </Box>
  )
}
