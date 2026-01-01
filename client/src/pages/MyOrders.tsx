import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Link,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material'
import { Receipt, TrackChanges } from '@mui/icons-material'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link as RouterLink } from 'react-router-dom'

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

export default function MyOrders() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery(
    ['my-orders'],
    async () => {
      const res = await api.get('/orders/my')
      return res.data.orders || []
    },
    { enabled: !!user }
  )

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Please log in to view your orders
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          No orders yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start shopping to see your orders here
        </Typography>
        <Button component={RouterLink} to="/shop" variant="contained" color="primary" size="large">
          Shop Now
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        My Orders
      </Typography>
      <Stack spacing={3} sx={{ mt: 3 }}>
        {data.map((order: any) => (
          <Paper key={order.id} sx={{ p: 3, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" component="h3" fontWeight={600}>
                    Order {order.code}
                  </Typography>
                  <Chip
                    label={statusLabels[order.status] || order.status}
                    color={statusColors[order.status] || 'default'}
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  ₵{(order.total / 100).toFixed(2)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  <Button
                    component={RouterLink}
                    to={`/orders/track?code=${order.code}`}
                    size="small"
                    startIcon={<TrackChanges />}
                  >
                    Track
                  </Button>
                  <Button
                    href={`/api/orders/${order.id}/invoice?code=${order.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<Receipt />}
                  >
                    Invoice
                  </Button>
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={500} gutterBottom>
              Items:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {order.items?.map((item: any) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    <strong>{item.variant?.name || 'Product'}</strong>
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      × {item.quantity}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₵{(item.unitPrice / 100).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {order.deliveryAddr && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                    Delivery Address:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddr}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}
