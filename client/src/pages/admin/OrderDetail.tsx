import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { getOrder, updateOrderStatus } from '../../api/admin'
import AdminLayout from '../../components/AdminLayout'

const statusColors: Record<string, 'warning' | 'info' | 'secondary' | 'success' | 'primary' | 'default' | 'error'> = {
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  PAID: 'primary',
  COMPLETED: 'default',
  CANCELLED: 'error',
}

export default function OrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery(
    ['admin:order', id],
    () => getOrder(id as string),
    { enabled: !!id }
  )
  const mutation = useMutation(
    (status: string) => updateOrderStatus(id as string, status),
    {
      onSuccess: () => qc.invalidateQueries(['admin:orders']),
    }
  )

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  const order = data?.order
  const events = data?.events || []

  if (!order) {
    return (
      <AdminLayout>
        <Alert severity="error">Order not found</Alert>
      </AdminLayout>
    )
  }

  const onChangeStatus = (status: string) => mutation.mutate(status)

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Order {order.code}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Customer Information
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {order.user?.name || order.user?.email || 'Guest'}
              </Typography>
              {order.user?.email && (
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {order.user.email}
                </Typography>
              )}
              {order.user?.phone && (
                <Typography variant="body1" gutterBottom>
                  <strong>Phone:</strong> {order.user.phone}
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Delivery Address
              </Typography>
              <Typography variant="body1">{order.deliveryAddr}</Typography>
              {order.deliveryNotes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Notes:</strong> {order.deliveryNotes}
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Order Items
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {order.items.map((it: any) => (
                  <Paper key={it.id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {it.variant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {it.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        ₵{(it.unitPrice / 100).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  ₵{(order.total / 100).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip label={order.status} color={statusColors[order.status] || 'default'} />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Update Status
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => onChangeStatus('CONFIRMED')}
                  fullWidth
                >
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => onChangeStatus('OUT_FOR_DELIVERY')}
                  fullWidth
                >
                  Out for Delivery
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onChangeStatus('DELIVERED')}
                  fullWidth
                >
                  Delivered
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onChangeStatus('CANCELLED')}
                  fullWidth
                >
                  Cancel
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Timeline
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {events.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No events yet
                  </Typography>
                ) : (
                  events.map((ev: any) => (
                    <Accordion key={ev.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(ev.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {ev.type}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            bgcolor: 'grey.50',
                            p: 1,
                            borderRadius: 1,
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(ev.payload, null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AdminLayout>
  )
}
