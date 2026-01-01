import React from 'react'
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
  CircularProgress,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { getOrders, exportOrdersCsv } from '../../api/admin'
import { useNavigate } from 'react-router-dom'
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

export default function Orders() {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [q, setQ] = React.useState('')

  const { data, isLoading } = useQuery(
    ['admin:orders', page, pageSize, status, q],
    () => getOrders({ page, pageSize, status, q }),
    { keepPreviousData: true }
  )
  const navigate = useNavigate()

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
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  const orders = data?.orders || []
  const meta = data?.meta || { page, pageSize, total: 0 }
  const totalPages = Math.ceil((meta.total || 0) / (meta.pageSize || 1))

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Orders
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              size="small"
              sx={{ width: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status || ''}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value || undefined)
                  setPage(1)
                }}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="PENDING_CONFIRMATION">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="OUT_FOR_DELIVERY">Out for delivery</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExport}>
              Export CSV
            </Button>
          </Stack>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o: any) => (
                <TableRow key={o.id} hover>
                  <TableCell>{o.code}</TableCell>
                  <TableCell>{o.user?.name || o.user?.email || 'Guest'}</TableCell>
                  <TableCell>₵{(o.total / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={o.status} color={statusColors[o.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing page {meta.page} of {totalPages} — {meta.total} orders
          </Typography>
          <Pagination
            count={totalPages}
            page={meta.page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Stack>
    </AdminLayout>
  )
}
