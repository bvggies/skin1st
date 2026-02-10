import React, { useState, useEffect } from 'react'
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material'
import { Warning, LocalShipping, Payment, LocationOn, Add, Edit } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import useCart from '../store/cart'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

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
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<Form>({ 
    resolver: zodResolver(Schema),
    defaultValues: {
      region: '',
    }
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')

  // Ensure cart.items is always an array (avoid blank page if store state is wrong)
  const cartItems = Array.isArray(cart?.items) ? cart.items : []

  // Check if coming from "Buy Now" with a direct item
  const buyNowItem = location.state?.buyNowItem

  const variantIds = buyNowItem 
    ? [buyNowItem.variantId] 
    : cartItems.map((i: any) => i.variantId)
  
  const itemsToCheckout = buyNowItem 
    ? [buyNowItem] 
    : cartItems

  const { data: variantsData, isLoading: variantsLoading, error: variantsError } = useQuery(
    ['variants', variantIds],
    async () => {
      if (variantIds.length === 0) return { variants: [] }
      const res = await api.get(`/variants?ids=${variantIds.join(',')}`)
      return res.data
    },
    { enabled: variantIds.length > 0, staleTime: 60 * 1000 } // API is cached
  )

  // Fetch saved addresses for logged-in users
  const { data: addressesData } = useQuery(
    ['my-addresses'],
    async () => {
      const res = await api.get('/user/addresses')
      return res.data
    },
    { 
      enabled: !!user, 
      staleTime: 60 * 1000,
      retry: false, // Don't retry if user is not logged in
      onError: () => {
        // Silently handle errors (user might not be logged in)
      }
    }
  )

  const savedAddresses = addressesData?.addresses || []
  const defaultAddress = savedAddresses.find((a: any) => a.isDefault)

  // Auto-select default address if available
  useEffect(() => {
    if (defaultAddress && selectedAddressId === 'new') {
      setSelectedAddressId(defaultAddress.id)
      loadAddressIntoForm(defaultAddress)
    }
  }, [defaultAddress])

  // Load address into form
  const loadAddressIntoForm = (address: any) => {
    setValue('name', address.recipientName)
    setValue('phone', address.phone)
    setValue('alternativePhone', address.alternativePhone || '')
    setValue('region', address.region)
    setValue('city', address.city)
    setValue('area', address.area || '')
    setValue('landmark', address.landmark || '')
    // Extract email if available (not stored in SavedAddress, so leave empty)
  }

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (addressId === 'new') {
      // Reset form for new address
      reset({
        name: '',
        email: '',
        phone: '',
        alternativePhone: '',
        region: '',
        city: '',
        area: '',
        landmark: '',
        deliveryNotes: '',
      })
      setSaveAddress(false)
      setAddressLabel('')
    } else {
      const address = savedAddresses.find((a: any) => a.id === addressId)
      if (address) {
        loadAddressIntoForm(address)
      }
    }
  }

  const variantsList = variantsData?.variants ?? []
  const subtotal = variantsList.reduce((s: number, v: any) => {
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

  // Mutation to save address
  const saveAddressMutation = useMutation(
    (addressData: any) => api.post('/user/addresses', addressData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-addresses'])
      },
      onError: (e: any) => {
        console.error('Failed to save address:', e)
        // Don't fail order if address save fails
      },
    }
  )

  async function onSubmit(data: Form) {
    if (itemsToCheckout.length === 0) {
      toast.error('No items to checkout')
      return
    }

    setIsSubmitting(true)

    try {
      const items = itemsToCheckout.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity }))
      
      // If using saved address, get data from saved address
      let orderData: any = {}
      if (selectedAddressId !== 'new' && user) {
        const savedAddress = savedAddresses.find((a: any) => a.id === selectedAddressId)
        if (savedAddress) {
          orderData = {
            name: savedAddress.recipientName,
            phone: savedAddress.phone,
            alternativePhone: savedAddress.alternativePhone || undefined,
            region: savedAddress.region,
            city: savedAddress.city,
            area: savedAddress.area || '',
            landmark: savedAddress.landmark || undefined,
            deliveryAddr: savedAddress.fullAddress,
            deliveryNotes: data.deliveryNotes || undefined,
          }
        }
      } else {
        // Use form data for new address
        const fullAddress = [
          data.area,
          data.city,
          data.region,
          data.landmark ? `Near: ${data.landmark}` : '',
        ].filter(Boolean).join(', ')

        orderData = {
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
        }

        // Save address if user wants to
        if (saveAddress && user && addressLabel.trim()) {
          try {
            await saveAddressMutation.mutateAsync({
              label: addressLabel.trim(),
              recipientName: data.name,
              phone: data.phone,
              alternativePhone: data.alternativePhone || undefined,
              region: data.region,
              city: data.city,
              area: data.area || undefined,
              landmark: data.landmark || undefined,
              fullAddress: fullAddress,
              isDefault: savedAddresses.length === 0, // Set as default if first address
            })
            toast.success('Address saved successfully!')
          } catch (e) {
            // Address save failed, but continue with order
            console.error('Failed to save address:', e)
          }
        }
      }

      const res = await api.post('/orders', {
        ...orderData,
        items,
        coupon: appliedCoupon?.coupon?.code || undefined,
      })

      console.log('Order API response:', res.data)

      // Validate response has order data
      if (!res.data?.order) {
        console.error('Invalid API response:', res.data)
        toast.error('Order placed but confirmation data is missing. Please contact support.')
        setIsSubmitting(false)
        return
      }

      // Validate order structure before navigation
      const orderResponse = res.data.order
      if (!orderResponse || !orderResponse.id || !orderResponse.code) {
        console.error('Invalid order response:', res.data)
        toast.error('Order placed but confirmation data is invalid. Please contact support with order code.')
        setIsSubmitting(false)
        return
      }

      // Only clear cart if not using Buy Now
      if (!buyNowItem) {
        await cart.clear()
      }
      
      // Navigate to order confirmation page with order details
      console.log('Navigating to order confirmation with:', {
        id: orderResponse.id,
        code: orderResponse.code,
        trackingCode: orderResponse.trackingCode,
        status: orderResponse.status,
        total: orderResponse.total,
      })
      
      navigate('/order-confirmation', {
        state: {
          order: {
            id: orderResponse.id,
            code: orderResponse.code,
            trackingCode: orderResponse.trackingCode || null,
            status: orderResponse.status || 'PENDING_CONFIRMATION',
            total: orderResponse.total || 0,
          },
          isGuestOrder: res.data.isGuestOrder
        },
        replace: true // Use replace to prevent back button issues
      })
    } catch (e: any) {
      console.error('Order placement error:', e)
      // Extract error message safely (handle objects, arrays, strings)
      let errorMsg = 'Failed to place order. Please try again.'
      if (e?.response?.data?.error) {
        const err = e.response.data.error
        if (typeof err === 'string') {
          errorMsg = err
        } else if (err?.message) {
          errorMsg = err.message
        } else if (Array.isArray(err) && err.length > 0) {
          errorMsg = typeof err[0] === 'string' ? err[0] : err[0]?.message || errorMsg
        }
      } else if (e?.message && typeof e.message === 'string') {
        errorMsg = e.message
      }
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

  // While loading variants for cart items, show loading (avoids blank or broken layout)
  if (variantsLoading && variantsList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">Loading checkout...</Typography>
      </Box>
    )
  }

  if (variantsError) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>Failed to load cart items. Please try again.</Alert>
        <Button onClick={() => navigate('/cart')} variant="contained">Back to Cart</Button>
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

          {/* Saved Addresses Selection (for logged-in users) */}
          {user && savedAddresses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Delivery Address
                </FormLabel>
                <RadioGroup
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                >
                  {savedAddresses.map((address: any) => (
                    <Card
                      key={address.id}
                      sx={{
                        mb: 2,
                        border: selectedAddressId === address.id ? 2 : 1,
                        borderColor: selectedAddressId === address.id ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <FormControlLabel
                            value={address.id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {address.label}
                                  </Typography>
                                  {address.isDefault && (
                                    <Chip label="Default" size="small" color="primary" />
                                  )}
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {address.recipientName} • {address.phone}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {address.fullAddress}
                                </Typography>
                                {address.area && (
                                  <Typography variant="caption" color="text.secondary">
                                    {address.area}, {address.city}, {address.region}
                                  </Typography>
                                )}
                              </Box>
                            }
                            sx={{ m: 0, flex: 1 }}
                          />
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/dashboard?tab=addresses')
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  <Card
                    sx={{
                      mb: 2,
                      border: selectedAddressId === 'new' ? 2 : 1,
                      borderColor: selectedAddressId === 'new' ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                    onClick={() => handleAddressSelect('new')}
                  >
                    <CardContent>
                      <FormControlLabel
                        value="new"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Add />
                            <Typography variant="subtitle1">Use New Address</Typography>
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                    </CardContent>
                  </Card>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Option to save address (for logged-in users using new address) */}
          {user && selectedAddressId === 'new' && (
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                }
                label="Save this address for future orders"
              />
              {saveAddress && (
                <TextField
                  label="Address Label (e.g., Home, Office)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="Home"
                  size="small"
                  sx={{ mt: 1, width: '100%', maxWidth: 300 }}
                  helperText="Give this address a name for easy identification"
                />
              )}
            </Box>
          )}

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
              const variant = variantsList.find((v: any) => v.id === item.variantId)
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
