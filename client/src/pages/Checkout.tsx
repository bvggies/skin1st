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
  Chip,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useCart from '../store/cart'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  deliveryAddr: z.string().min(5),
  deliveryNotes: z.string().optional(),
})

type Form = z.infer<typeof Schema>

export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<Form>({ resolver: zodResolver(Schema) })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

  const variantIds = cart.items.map((i) => i.variantId)
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
    const qty = cart.items.find((it: any) => it.variantId === v.id)?.quantity || 0
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
    if (cart.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const items = cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
      const res = await api.post('/orders', {
        ...data,
        items,
        coupon: appliedCoupon?.coupon?.code || undefined,
      })
      toast.success(`Order placed successfully! Order code: ${res.data.order.code}`)
      cart.clear()
      navigate(`/orders/track?code=${res.data.order.code}`)
    } catch (e: any) {
      console.error(e)
      const errorMsg = e.response?.data?.error || 'Failed to place order'
      toast.error(errorMsg)
    }
  }

  if (cart.items.length === 0) {
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
        <Paper sx={{ p: 3, mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                {...register('name')}
                label="Full name *"
                fullWidth
                required
              />
              <TextField
                {...register('phone')}
                label="Phone *"
                type="tel"
                fullWidth
                required
              />
              <TextField
                {...register('deliveryAddr')}
                label="Delivery address *"
                multiline
                rows={3}
                fullWidth
                required
              />
              <TextField
                {...register('deliveryNotes')}
                label="Delivery notes (optional)"
                fullWidth
                helperText="Any special instructions for delivery"
              />
            </Stack>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
          <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
            Order Summary
          </Typography>

          <Stack spacing={1} sx={{ my: 3 }}>
            {cart.items.map((item: any) => {
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
              <Alert severity="error" sx={{ mt: 1 }} size="small">
                {couponError}
              </Alert>
            )}
            {appliedCoupon && (
              <Alert severity="success" sx={{ mt: 1 }} size="small">
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
            sx={{ mt: 3 }}
          >
            Place Order (COD)
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            You'll pay when you receive your order
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}
