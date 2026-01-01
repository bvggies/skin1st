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
import toast from 'react-hot-toast'

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
      onSuccess: (data) => {
        qc.invalidateQueries(['admin:orders'])
        qc.invalidateQueries(['admin:order', id])
        toast.success(`Order status updated to ${data.order.status}`)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update order status')
      },
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.customerName || order.user?.name || 'Guest'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.user?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    <a href={`tel:${order.phone}`} style={{ color: 'inherit' }}>{order.phone || 'N/A'}</a>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">WhatsApp/Alternative</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.alternativePhone ? (
                      <a 
                        href={`https://wa.me/${order.alternativePhone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#25D366' }}
                      >
                        {order.alternativePhone}
                      </a>
                    ) : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                Delivery Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Region</Typography>
                  <Typography variant="body1" fontWeight={500}>{order.region || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">City/Town</Typography>
                  <Typography variant="body1" fontWeight={500}>{order.city || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Area/Neighborhood</Typography>
                  <Typography variant="body1" fontWeight={500}>{order.area || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Landmark</Typography>
                  <Typography variant="body1" fontWeight={500}>{order.landmark || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Full Address</Typography>
                  <Typography variant="body1" fontWeight={500}>{order.deliveryAddr}</Typography>
                </Grid>
                {order.deliveryNotes && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Delivery Notes:</strong> {order.deliveryNotes}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>

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
                  disabled={mutation.isLoading || order.status === 'CONFIRMED'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Confirm'}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => onChangeStatus('OUT_FOR_DELIVERY')}
                  fullWidth
                  disabled={mutation.isLoading || order.status === 'OUT_FOR_DELIVERY'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Out for Delivery'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onChangeStatus('DELIVERED')}
                  fullWidth
                  disabled={mutation.isLoading || order.status === 'DELIVERED'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Delivered'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onChangeStatus('PAID')}
                  fullWidth
                  disabled={mutation.isLoading || order.status === 'PAID'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Mark as Paid'}
                </Button>
                <Button
                  variant="contained"
                  color="default"
                  onClick={() => onChangeStatus('COMPLETED')}
                  fullWidth
                  disabled={mutation.isLoading || order.status === 'COMPLETED'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Complete'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onChangeStatus('CANCELLED')}
                  fullWidth
                  disabled={mutation.isLoading || order.status === 'CANCELLED'}
                >
                  {mutation.isLoading ? 'Updating...' : 'Cancel'}
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
