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
} from '@mui/material'
import api from '../api/axios'
import { useSearchParams } from 'react-router-dom'

const statusColors: Record<string, 'warning' | 'info' | 'secondary' | 'success' | 'primary' | 'default' | 'error'> = {
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  PAID: 'primary',
  COMPLETED: 'default',
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

const orderSteps = [
  { status: 'PENDING_CONFIRMATION', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Order Confirmed' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'PAID', label: 'Payment Received' },
  { status: 'COMPLETED', label: 'Order Completed' },
]

export default function OrderTrack() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [phone, setPhone] = useState('')
  const [trackingCode, setTrackingCode] = useState(code)

  const { data, isLoading, error, refetch } = useQuery(
    ['order-track', trackingCode, phone],
    async () => {
      const params = new URLSearchParams({ code: trackingCode })
      if (phone) params.set('phone', phone)
      const res = await api.get(`/orders/track?${params.toString()}`)
      return res.data.order
    },
    { enabled: !!trackingCode }
  )

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      setTrackingCode(code.trim())
      refetch()
    }
  }

  const getActiveStep = () => {
    if (!data) return 0
    const index = orderSteps.findIndex((step) => step.status === data.status)
    return index >= 0 ? index : 0
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Track Your Order
      </Typography>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box component="form" onSubmit={handleTrack}>
          <Stack spacing={3}>
            <TextField
              type="text"
              label="Order Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ORD-XXXXXXX"
              required
              fullWidth
            />
            <TextField
              type="tel"
              label="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For verification"
              fullWidth
              helperText="Enter your phone number for additional security"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large">
              Track Order
            </Button>
          </Stack>
        </Box>
      </Paper>

      {isLoading && trackingCode && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading order information...
          </Typography>
        </Paper>
      )}

      {error && trackingCode && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as any)?.response?.data?.error || 'Order not found. Please check your order code and try again.'}
        </Alert>
      )}

      {data && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                Order {data.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on{' '}
                {new Date(data.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            <Chip
              label={statusLabels[data.status] || data.status}
              color={statusColors[data.status] || 'default'}
              size="medium"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" component="h3" gutterBottom fontWeight={500}>
            Order Items
          </Typography>
          <Stack spacing={2} sx={{ my: 2 }}>
            {data.items?.map((item: any) => (
              <Paper key={item.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {item.variant?.name || 'Product'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" fontWeight={500}>
                      ₵{(item.unitPrice / 100).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₵{((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h4" color="primary" fontWeight={700}>
              ₵{(data.total / 100).toFixed(2)}
            </Typography>
          </Box>

          {data.deliveryAddr && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight={500}>
                  Delivery Address
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {data.deliveryAddr}
                </Typography>
                {data.deliveryNotes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Notes:</strong> {data.deliveryNotes}
                  </Typography>
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" component="h3" gutterBottom fontWeight={500}>
            Order Status Timeline
          </Typography>
          <Stepper activeStep={getActiveStep()} orientation="vertical" sx={{ mt: 2 }}>
            {orderSteps.map((step, index) => {
              const isActive = data.status === step.status
              const isPast = getActiveStep() > index
              return (
                <Step key={step.status} completed={isPast} active={isActive}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </Paper>
      )}
    </Container>
  )
}
