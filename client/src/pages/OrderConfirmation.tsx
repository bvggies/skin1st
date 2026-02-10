import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  ContentCopy,
  LocalShipping,
  Receipt,
  WhatsApp,
  Home,
  TrackChanges,
  Print,
} from '@mui/icons-material'
import toast from 'react-hot-toast'

interface OrderData {
  id: string
  code: string
  trackingCode?: string | null
  status: string
  total: number
}

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [copied, setCopied] = useState<'code' | 'tracking' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      // Get order data from navigation state
      const state = location.state as { order?: OrderData; isGuestOrder?: boolean }
      
      console.log('OrderConfirmation - location.state:', state)
      console.log('OrderConfirmation - location.pathname:', location.pathname)
      
      if (state?.order) {
        // Validate order data has required fields (trackingCode optional for legacy orders)
        if (state.order.id && state.order.code) {
          console.log('OrderConfirmation - Setting order:', state.order)
          setOrder(state.order)
          setIsLoading(false)
        } else {
          console.error('Invalid order data:', state.order)
          toast.error('Invalid order data. Redirecting...')
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
        }
      } else {
        // If no order data, show error and redirect to home
        console.warn('No order data in navigation state. State:', state)
        toast.error('Order data not found. Redirecting...')
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)
      }
    } catch (err) {
      console.error('OrderConfirmation useEffect error:', err)
      toast.error('An error occurred. Redirecting...')
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 2000)
    }
  }, [location.state, location.pathname, navigate])

  const copyToClipboard = async (text: string, type: 'code' | 'tracking') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type === 'tracking' ? 'Tracking code' : 'Order code'} copied!`)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+1234567890'

  // Show loading state while checking for order data
  if (isLoading || !order) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Box>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Loading order confirmation...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If this takes too long, you may have been redirected incorrectly.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
              '70%': { boxShadow: '0 0 0 20px rgba(76, 175, 80, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
            },
          }}
        >
          <CheckCircle sx={{ fontSize: 50, color: 'success.main' }} />
        </Box>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Order Placed Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Thank you for your order. We're preparing your items and will notify you once they're on the way.
        </Typography>
      </Box>

      {/* Important: Tracking Code for Guests (only when present) */}
      {order.trackingCode && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            bgcolor: 'warning.lighter',
            border: '2px solid',
            borderColor: 'warning.main',
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <LocalShipping color="warning" />
            <Typography variant="h6" fontWeight={600} color="warning.dark">
              ⚠️ Important: Save Your Tracking Code!
            </Typography>
          </Stack>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This is your unique tracking code. You'll need it to track your order status.
            <strong> Please save it somewhere safe!</strong>
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 3,
              bgcolor: 'white',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'warning.main',
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              fontFamily="monospace"
              letterSpacing={2}
              sx={{ color: 'warning.dark' }}
            >
              {order.trackingCode}
            </Typography>
            <Tooltip title={copied === 'tracking' ? 'Copied!' : 'Copy tracking code'}>
              <IconButton
                onClick={() => copyToClipboard(order.trackingCode!, 'tracking')}
                color={copied === 'tracking' ? 'success' : 'default'}
                sx={{
                  bgcolor: copied === 'tracking' ? 'success.light' : 'grey.100',
                  '&:hover': { bgcolor: copied === 'tracking' ? 'success.light' : 'grey.200' },
                }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            💡 Tip: Take a screenshot or write this code down. You can use it to track your order anytime.
          </Typography>
        </Paper>
      )}

      {/* Order Details */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Order Details
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Order Code:</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                {order.code}
              </Typography>
              <Tooltip title="Copy order code">
                <IconButton size="small" onClick={() => copyToClipboard(order.code, 'code')}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip 
              label="Pending Confirmation" 
              color="warning" 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight={600}>Total Amount:</Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              ₵{(order.total / 100).toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Payment on Delivery:</strong> Please have the exact amount ready when your order arrives. 
            Our delivery agent will collect the payment.
          </Typography>
        </Alert>
      </Paper>

      {/* What's Next */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          What Happens Next?
        </Typography>
        
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              1
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Order Confirmation</Typography>
              <Typography variant="body2" color="text.secondary">
                We'll review and confirm your order within a few hours.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                color: 'grey.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              2
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Processing</Typography>
              <Typography variant="body2" color="text.secondary">
                Your items will be carefully packed and prepared for shipping.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                color: 'grey.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              3
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Out for Delivery</Typography>
              <Typography variant="body2" color="text.secondary">
                You'll receive a notification when your order is on the way.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                color: 'grey.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              4
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Delivery</Typography>
              <Typography variant="body2" color="text.secondary">
                Pay on delivery and enjoy your products!
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Action Buttons */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="center"
        flexWrap="wrap"
      >
        {order.trackingCode && (
          <>
            <Button
              component={RouterLink}
              to={`/orders/track?trackingCode=${order.trackingCode}`}
              variant="contained"
              size="large"
              startIcon={<TrackChanges />}
              sx={{ minWidth: 200 }}
            >
              Track Order
            </Button>
            <Button
              component="a"
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=Hi! I just placed an order. My tracking code is: ${order.trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              startIcon={<WhatsApp />}
              color="success"
              sx={{ minWidth: 200 }}
            >
              Contact Support
            </Button>
          </>
        )}
        <Button
          variant="outlined"
          size="large"
          startIcon={<Print />}
          onClick={() => window.print()}
          sx={{ minWidth: 200 }}
        >
          Print
        </Button>
        <Button
          component={RouterLink}
          to="/"
          variant="outlined"
          size="large"
          startIcon={<Home />}
          sx={{ minWidth: 200 }}
        >
          Continue Shopping
        </Button>
      </Stack>

      {/* Reminder Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Questions about your order? Contact us on WhatsApp or use your tracking code to check status anytime.
        </Typography>
      </Box>
    </Container>
  )
}

