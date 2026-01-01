import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Stack,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { Warning, LocalShipping, Payment } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import useCart from '../store/cart'
import api from '../api/axios'
import toast from 'react-hot-toast'

// Ghana Regions
const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Bono',
  'Bono East',
  'Ahafo',
  'Western North',
  'Oti',
  'North East',
  'Savannah',
]

const Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  alternativePhone: z.string().optional(),
  region: z.string().min(1, 'Please select your region'),
  city: z.string().min(2, 'Please enter your city/town'),
  area: z.string().min(2, 'Please enter your area/neighborhood'),
  landmark: z.string().optional(),
  deliveryNotes: z.string().optional(),
})

type Form = z.infer<typeof Schema>

export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<Form>({ 
    resolver: zodResolver(Schema),
    defaultValues: {
      region: '',
    }
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if coming from "Buy Now" with a direct item
  const buyNowItem = location.state?.buyNowItem

  const variantIds = buyNowItem 
    ? [buyNowItem.variantId] 
    : cart.items.map((i) => i.variantId)
  
  const itemsToCheckout = buyNowItem 
    ? [buyNowItem] 
    : cart.items

  const { data: variantsData } = useQuery(
    ['variants', variantIds],
    async () => {
      if (variantIds.length === 0) return { variants: [] }
      const res = await api.get(`/variants?ids=${variantIds.join(',')}`)
      return res.data
    },
    { enabled: variantIds.length > 0 }
  )

  const subtotal = (variantsData?.variants || []).reduce((s: any, v: any) => {
    const item = itemsToCheckout.find((it: any) => it.variantId === v.id)
    const qty = item?.quantity || 0
    const price = v.price - (v.discount || 0)
    return s + price * qty
  }, 0)

  const discount = appliedCoupon?.discount || 0
  const total = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    try {
      const res = await api.post('/coupons.validate', { code: couponCode, total: subtotal })
      setAppliedCoupon(res.data)
      setCouponError('')
      toast.success('Coupon applied successfully!')
    } catch (e: any) {
      setCouponError(e.response?.data?.error || 'Invalid coupon code')
      setAppliedCoupon(null)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  async function onSubmit(data: Form) {
    if (itemsToCheckout.length === 0) {
      toast.error('No items to checkout')
      return
    }

    setIsSubmitting(true)

    try {
      const items = itemsToCheckout.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity }))
      
      // Combine address fields into full delivery address
      const fullAddress = [
        data.area,
        data.city,
        data.region,
        data.landmark ? `Near: ${data.landmark}` : '',
      ].filter(Boolean).join(', ')

      const res = await api.post('/orders', {
        name: data.name,
        phone: data.phone,
        alternativePhone: data.alternativePhone || undefined,
        guestEmail: data.email || undefined,
        region: data.region,
        city: data.city,
        area: data.area,
        landmark: data.landmark || undefined,
        deliveryAddr: fullAddress,
        deliveryNotes: data.deliveryNotes || undefined,
        items,
        coupon: appliedCoupon?.coupon?.code || undefined,
      })

      // Validate response has order data
      if (!res.data?.order) {
        console.error('Invalid API response:', res.data)
        toast.error('Order placed but confirmation data is missing. Please contact support.')
        return
      }

      // Only clear cart if not using Buy Now
      if (!buyNowItem) {
        cart.clear()
      }
      
      // Navigate to order confirmation page with order details
      navigate('/order-confirmation', {
        state: {
          order: res.data.order,
          isGuestOrder: res.data.isGuestOrder
        },
        replace: true // Use replace to prevent back button issues
      })
    } catch (e: any) {
      console.error('Order placement error:', e)
      const errorMsg = e.response?.data?.error || 'Failed to place order. Please try again.'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (itemsToCheckout.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Your cart is empty
        </Typography>
        <Button
          onClick={() => navigate('/shop')}
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Checkout
        </Typography>

        {/* Important Notice */}
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            PLEASE NOTE:
          </Typography>
          <Typography variant="body2">
            Before filling the order form, make sure you are ready to receive your package and pay at the point of delivery. 
            We use Cash on Delivery (COD) payment method.
          </Typography>
        </Alert>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LocalShipping color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Delivery Information
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Personal Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Personal Details
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('name')}
                  label="Full Name *"
                  placeholder="Enter your full name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('email')}
                  label="Email Address"
                  placeholder="your@email.com"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message || 'Optional - for order updates'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('phone')}
                  label="Active Phone Number *"
                  placeholder="e.g., 0244123456"
                  type="tel"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message || 'We will call this number for delivery'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('alternativePhone')}
                  label="Alternative/WhatsApp Number"
                  placeholder="e.g., 0201234567"
                  type="tel"
                  fullWidth
                  helperText="Optional - for WhatsApp updates"
                />
              </Grid>

              {/* Delivery Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Delivery Address
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('region')}
                  select
                  label="Region *"
                  fullWidth
                  error={!!errors.region}
                  helperText={errors.region?.message}
                  defaultValue=""
                >
                  <MenuItem value="">Select your region</MenuItem>
                  {GHANA_REGIONS.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('city')}
                  label="City/Town *"
                  placeholder="e.g., Accra, Kumasi, Tema"
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('area')}
                  label="Area/Neighborhood *"
                  placeholder="e.g., East Legon, Osu, Adum"
                  fullWidth
                  error={!!errors.area}
                  helperText={errors.area?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('landmark')}
                  label="Nearby Landmark"
                  placeholder="e.g., Near Total Filling Station"
                  fullWidth
                  helperText="Optional - helps our delivery rider find you"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('deliveryNotes')}
                  label="Additional Delivery Instructions"
                  placeholder="Any special instructions for delivery (e.g., gate color, floor number, best time to deliver)"
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Payment color="primary" />
            <Typography variant="h6" component="h2" fontWeight={600}>
              Order Summary
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ my: 3 }}>
            {itemsToCheckout.map((item: any) => {
              const variant = variantsData?.variants?.find((v: any) => v.id === item.variantId)
              if (!variant) return null
              const price = (variant.price - (variant.discount || 0)) / 100
              return (
                <Box key={item.variantId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {variant.product?.name || 'Product'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {variant.name} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    ₵{(price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              )
            })}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Coupon Code
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                size="small"
                disabled={!!appliedCoupon}
                sx={{ flex: 1 }}
              />
              {appliedCoupon ? (
                <Button onClick={handleRemoveCoupon} color="error" size="small">
                  Remove
                </Button>
              ) : (
                <Button onClick={handleApplyCoupon} variant="outlined" size="small">
                  Apply
                </Button>
              )}
            </Stack>
            {couponError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {couponError}
              </Alert>
            )}
            {appliedCoupon && (
              <Alert severity="success" sx={{ mt: 1 }}>
                ✓ Coupon {appliedCoupon.coupon.code} applied! Save ₵{(appliedCoupon.discount / 100).toFixed(2)}
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">₵{(subtotal / 100).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Delivery</Typography>
              <Typography variant="body2" color="success.main">FREE</Typography>
            </Box>
            {appliedCoupon && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="success.main">
                  Discount ({appliedCoupon.coupon.code})
                </Typography>
                <Typography variant="body2" color="success.main">
                  -₵{(discount / 100).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={600}>
                ₵{(total / 100).toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
          </Button>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Cash on Delivery:</strong> You'll pay when you receive your order. 
              Our delivery rider will contact you before arrival.
            </Typography>
          </Alert>
        </Paper>
      </Grid>
    </Grid>
  )
}
