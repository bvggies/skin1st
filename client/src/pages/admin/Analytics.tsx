import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'

export default function Analytics() {
  const [period, setPeriod] = React.useState('30')

  const { data, isLoading } = useQuery(['admin:analytics', period], async () => {
    const res = await api.get(`/admin/analytics?period=${period}`)
    return res.data
  })

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  const stats = data?.stats || {}
  const ordersByStatus = data?.ordersByStatus || []
  const topProducts = data?.topProducts || []

  const renderChart = () => {
    if (!ordersByStatus || !Array.isArray(ordersByStatus) || ordersByStatus.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ordersByStatus}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Analytics Dashboard
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalOrders || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ₵{((stats.totalRevenue || 0) / 100).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalUsers || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ₵{((stats.averageOrderValue || 0) / 100).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
            Orders by Status
          </Typography>
          {renderChart()}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
            Top Products
          </Typography>
          {topProducts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {topProducts.map((product: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    '&:hover': { bgcolor: 'grey.50' },
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.variantName}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {product.quantity} sold
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </AdminLayout>
  )
}
