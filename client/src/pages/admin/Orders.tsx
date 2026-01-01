import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Pagination,
  FormControl,
  InputLabel,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Grid,
  alpha,
  Menu,
} from '@mui/material'
import {
  Download,
  Search,
  Visibility,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
  Receipt,
  FilterList,
  MoreVert,
  Phone,
  LocationOn,
  Refresh,
} from '@mui/icons-material'
import { getOrders, exportOrdersCsv } from '../../api/admin'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { color: 'warning' | 'info' | 'secondary' | 'success' | 'primary' | 'default' | 'error'; icon: React.ReactNode; label: string }> = {
  PENDING_CONFIRMATION: { color: 'warning', icon: <Pending />, label: 'Pending' },
  CONFIRMED: { color: 'info', icon: <CheckCircle />, label: 'Confirmed' },
  OUT_FOR_DELIVERY: { color: 'secondary', icon: <LocalShipping />, label: 'Out for Delivery' },
  DELIVERED: { color: 'success', icon: <CheckCircle />, label: 'Delivered' },
  PAID: { color: 'primary', icon: <Receipt />, label: 'Paid' },
  COMPLETED: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
  CANCELLED: { color: 'error', icon: <Cancel />, label: 'Cancelled' },
}

export default function Orders() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useQuery(
    ['admin:orders', page, pageSize, status, q],
    () => getOrders({ page, pageSize, status, q }),
    { keepPreviousData: true }
  )

  const handleExport = async () => {
    try {
      const blob = await exportOrdersCsv({ page, pageSize, status, q })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Orders exported successfully')
    } catch (e) {
      toast.error('Failed to export orders')
      console.error(e)
    }
  }

  const orders = data?.orders || []
  const meta = data?.meta || { page, pageSize, total: 0 }
  const totalPages = Math.ceil((meta.total || 0) / (meta.pageSize || 1))

  const clearFilters = () => {
    setQ('')
    setStatus(undefined)
    setPage(1)
  }

  const hasFilters = q || status

  // Calculate stats
  const stats = {
    pending: orders.filter((o: any) => o.status === 'PENDING_CONFIRMATION').length,
    confirmed: orders.filter((o: any) => o.status === 'CONFIRMED').length,
    outForDelivery: orders.filter((o: any) => o.status === 'OUT_FOR_DELIVERY').length,
    completed: orders.filter((o: any) => ['DELIVERED', 'PAID', 'COMPLETED'].includes(o.status)).length,
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {meta.total || 0} total orders
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* Quick Stats */}
        <Grid container spacing={2}>
          {[
            { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: <Pending /> },
            { label: 'Confirmed', value: stats.confirmed, color: '#6366f1', icon: <CheckCircle /> },
            { label: 'Out for Delivery', value: stats.outForDelivery, color: '#8b5cf6', icon: <LocalShipping /> },
            { label: 'Completed', value: stats.completed, color: '#10b981', icon: <CheckCircle /> },
          ].map((stat, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                placeholder="Search by order code, customer name, phone..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPage(1)
                }}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={8} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status || ''}
                  label="Status"
                  onChange={(e) => {
                    setStatus(e.target.value || undefined)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {config.icon}
                        <span>{config.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} md={3}>
              {hasFilters && (
                <Button onClick={clearFilters} size="small" fullWidth>
                  Clear Filters
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Receipt sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hasFilters ? 'Try different filters' : 'Orders will appear here when customers place them'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o: any) => {
                    const config = statusConfig[o.status] || { color: 'default', icon: <Receipt />, label: o.status }
                    return (
                      <TableRow
                        key={o.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td': { border: 0 },
                        }}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(config.color === 'default' ? '#6b7280' : 
                                  config.color === 'warning' ? '#f59e0b' :
                                  config.color === 'info' ? '#3b82f6' :
                                  config.color === 'secondary' ? '#8b5cf6' :
                                  config.color === 'success' ? '#10b981' :
                                  config.color === 'primary' ? '#6366f1' :
                                  config.color === 'error' ? '#ef4444' : '#6b7280', 0.1),
                                width: 40,
                                height: 40,
                              }}
                            >
                              {config.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                #{o.code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {o.id.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {o.customerName || o.user?.name || 'Guest'}
                            </Typography>
                            {o.phone && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Phone sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {o.phone}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {o.items?.length || 0} item(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            ₵{(o.total / 100).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={config.icon as React.ReactElement}
                            label={config.label}
                            color={config.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Order">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/admin/orders/${o.id}`)
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Page {meta.page} of {totalPages} • {meta.total} total orders
              </Typography>
              <Pagination
                count={totalPages}
                page={meta.page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Paper>
      </Stack>
    </AdminLayout>
  )
}
