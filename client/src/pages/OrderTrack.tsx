import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Container,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  ContentCopy,
  Receipt,
  Timeline as TimelineIcon,
  Inventory,
} from '@mui/icons-material'
import api from '../api/axios'
import { useSearchParams, Link as RouterLink } from 'react-router-dom'
import toast from 'react-hot-toast'

const statusColors: Record<string, 'warning' | 'info' | 'secondary' | 'success' | 'primary' | 'default' | 'error'> = {
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  PAID: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Pending Confirmation',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const statusDescriptions: Record<string, string> = {
  PENDING_CONFIRMATION: 'Your order is being reviewed by our team',
  CONFIRMED: 'Order confirmed! We\'re preparing your items',
  OUT_FOR_DELIVERY: 'Your package is on the way!',
  DELIVERED: 'Your order has been delivered',
  PAID: 'Payment received successfully',
  COMPLETED: 'Thank you for your order!',
  CANCELLED: 'This order has been cancelled',
}

const orderSteps = [
  { status: 'PENDING_CONFIRMATION', label: 'Order Placed', icon: <Receipt /> },
  { status: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircle /> },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <LocalShipping /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <Inventory /> },
]

export default function OrderTrack() {
  const [searchParams] = useSearchParams()
  const initialCode = searchParams.get('trackingCode') || searchParams.get('code') || ''
  const [inputCode, setInputCode] = useState(initialCode)
  const [phone, setPhone] = useState('')
  const [searchCode, setSearchCode] = useState(initialCode)
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading, error, refetch } = useQuery(
    ['order-track', searchCode, phone],
    async () => {
      const params = new URLSearchParams()
      // Determine if it's a tracking code or order code
      if (searchCode.startsWith('TRK-')) {
        params.set('trackingCode', searchCode)
      } else {
        params.set('code', searchCode)
      }
      if (phone) params.set('phone', phone)
      const res = await api.get(`/orders/track?${params.toString()}`)
      return res.data.order
    },
    { enabled: !!searchCode, retry: false }
  )

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.trim()) {
      setSearchCode(inputCode.trim().toUpperCase())
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied!`)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const getActiveStep = () => {
    if (!data) return 0
    if (data.status === 'CANCELLED') return -1
    const index = orderSteps.findIndex((step) => step.status === data.status)
    return index >= 0 ? index : 0
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Track Your Order
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enter your order code or tracking code to see the status of your order
      </Typography>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleTrack}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              type="text"
              label="Order Code or Tracking Code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="ORD-XXXXXXX or TRK-XXXXXXX-XXXX"
              required
              fullWidth
              sx={{ flex: 2 }}
            />
            <TextField
              type="tel"
              label="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For verification"
              sx={{ flex: 1 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 4, minWidth: 150 }}
            >
              Track
            </Button>
          </Stack>
        </Box>
      </Paper>

      {isLoading && searchCode && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 3 }} color="text.secondary">
            Finding your order...
          </Typography>
        </Paper>
      )}

      {error && searchCode && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {(error as any)?.response?.data?.error || 'Order not found. Please check your order code and try again.'}
        </Alert>
      )}

      {data && (
        <>
          {/* Status Overview Card */}
          <Paper sx={{ p: 4, mb: 3, borderRadius: 3, bgcolor: statusColors[data.status] === 'error' ? 'error.lighter' : 'primary.lighter' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }} justifyContent="space-between">
              <Box>
                <Chip
                  label={statusLabels[data.status] || data.status}
                  color={statusColors[data.status] || 'default'}
                  size="medium"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {statusDescriptions[data.status]}
                </Typography>
                {data.estimatedDelivery && data.status !== 'DELIVERED' && data.status !== 'COMPLETED' && data.status !== 'CANCELLED' && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Estimated delivery: {new Date(data.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </Typography>
                  </Stack>
                )}
                {data.deliveredAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main">
                      Delivered on {formatDate(data.deliveredAt)}
                    </Typography>
                  </Stack>
                )}
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="body2" color="text.secondary">Order Total</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  ₵{(data.total / 100).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Order Codes */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Order Code</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontFamily="monospace" fontWeight={600}>{data.code}</Typography>
                  <Tooltip title="Copy order code">
                    <IconButton size="small" onClick={() => copyToClipboard(data.code, 'Order code')}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Tracking Code</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontFamily="monospace" fontWeight={600} color="warning.main">{data.trackingCode}</Typography>
                  <Tooltip title="Copy tracking code">
                    <IconButton size="small" onClick={() => copyToClipboard(data.trackingCode, 'Tracking code')}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Order Date</Typography>
                <Typography variant="body1" fontWeight={500}>{formatDate(data.createdAt)}</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Progress Stepper */}
          {data.status !== 'CANCELLED' && (
            <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Progress
              </Typography>
              <Box sx={{ mt: 3, px: { xs: 0, md: 4 } }}>
                <Stepper activeStep={getActiveStep()} alternativeLabel>
                  {orderSteps.map((step, index) => {
                    const isCompleted = getActiveStep() > index
                    const isActive = getActiveStep() === index
                    return (
                      <Step key={step.status} completed={isCompleted}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.300',
                                color: isCompleted || isActive ? 'white' : 'grey.500',
                              }}
                            >
                              {isCompleted ? <CheckCircle /> : step.icon}
                            </Avatar>
                          )}
                        >
                          <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                            {step.label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </Box>
            </Paper>
          )}

          {/* Tabs for Details */}
          <Paper sx={{ borderRadius: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Order Items" icon={<Inventory />} iconPosition="start" />
              <Tab label="Delivery Info" icon={<LocationOn />} iconPosition="start" />
              <Tab label="Status History" icon={<TimelineIcon />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Order Items Tab */}
              {activeTab === 0 && (
                <Stack spacing={2}>
                  {data.items?.map((item: any) => (
                    <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {item.variant?.product?.images?.[0]?.url && (
                            <Box
                              component="img"
                              src={item.variant.product.images[0].url}
                              alt={item.variant.name}
                              sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                            />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {item.variant?.product?.name || 'Product'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.variant?.name} × {item.quantity}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" fontWeight={600}>
                              ₵{((item.unitPrice * item.quantity) / 100).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₵{(item.unitPrice / 100).toFixed(2)} each
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>Total</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      ₵{(data.total / 100).toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              )}

              {/* Delivery Info Tab */}
              {activeTab === 1 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Recipient
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>{data.customerName}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{data.phone}</Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Delivery Address
                    </Typography>
                    <Stack spacing={1}>
                      {data.area && <Typography variant="body1">{data.area}</Typography>}
                      {data.city && <Typography variant="body1">{data.city}</Typography>}
                      {data.region && <Typography variant="body1">{data.region}</Typography>}
                      {data.landmark && (
                        <Typography variant="body2" color="text.secondary">
                          Landmark: {data.landmark}
                        </Typography>
                      )}
                      {!data.area && !data.city && data.deliveryAddr && (
                        <Typography variant="body1">{data.deliveryAddr}</Typography>
                      )}
                    </Stack>
                  </Box>
                  {data.deliveryNotes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Delivery Notes
                        </Typography>
                        <Typography variant="body1">{data.deliveryNotes}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              )}

              {/* Status History Tab */}
              {activeTab === 2 && (
                <Stack spacing={0}>
                  {data.statusHistory && data.statusHistory.length > 0 ? (
                    data.statusHistory.map((history: any, index: number) => (
                      <Box 
                        key={history.id} 
                        sx={{ 
                          display: 'flex', 
                          gap: 2,
                          pb: 3,
                          position: 'relative',
                          '&::before': index < data.statusHistory.length - 1 ? {
                            content: '""',
                            position: 'absolute',
                            left: 15,
                            top: 32,
                            bottom: 0,
                            width: 2,
                            bgcolor: 'grey.300',
                          } : {}
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: index === 0 ? 'primary.main' : 'grey.300',
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {statusLabels[history.status] || history.status}
                          </Typography>
                          {history.note && (
                            <Typography variant="body2" color="text.secondary">
                              {history.note}
                            </Typography>
                          )}
                          {history.location && (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14 }} color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {history.location}
                              </Typography>
                            </Stack>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatDate(history.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Alert severity="info">
                      Status history will appear here as your order progresses.
                    </Alert>
                  )}
                </Stack>
              )}
            </Box>
          </Paper>

          {/* Help Section */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you have any questions about your order, please contact us on WhatsApp or call our customer service.
              Have your tracking code ready: <strong>{data.trackingCode}</strong>
            </Typography>
          </Paper>
        </>
      )}
    </Container>
  )
}
