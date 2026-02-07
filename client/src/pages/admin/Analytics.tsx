import React, { useState } from 'react'
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
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  alpha,
  Skeleton,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'

const COLORS = ['#e94560', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: number
  color: string
}

function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: alpha(color, 0.1),
        }}
      />
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend >= 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              color={trend >= 0 ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default function Analytics() {
  const [period, setPeriod] = useState('30')

  const { data, isLoading } = useQuery(
    ['admin:analytics', period],
    async () => {
      const res = await api.get(`/admin/analytics?period=${period}`)
      return res.data
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes — no polling; use manual refetch or refetchOnWindowFocus
      refetchOnWindowFocus: true,
    }
  )

  const stats = data?.stats || {}
  const ordersByStatus = data?.ordersByStatus || []
  const topProducts = data?.topProducts || []
  const recentOrders = data?.recentOrders || []
  const revenueByDay = data?.revenueByDay || []

  // Prepare chart data
  const statusChartData = ordersByStatus.map((item: any) => ({
    name: item.status.replace(/_/g, ' '),
    value: item.count || item._count?.id || 0,
  }))

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_CONFIRMATION: '#f59e0b',
      CONFIRMED: '#6366f1',
      OUT_FOR_DELIVERY: '#3b82f6',
      DELIVERED: '#10b981',
      PAID: '#22c55e',
      COMPLETED: '#059669',
      CANCELLED: '#ef4444',
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return <Pending />
      case 'OUT_FOR_DELIVERY':
        return <LocalShipping />
      case 'DELIVERED':
      case 'COMPLETED':
        return <CheckCircle />
      case 'CANCELLED':
        return <Cancel />
      default:
        return <ShoppingCart />
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Analytics Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your business performance
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="analytics-period-label">Time Period</InputLabel>
            <Select id="analytics-period" labelId="analytics-period-label" value={period} label="Time Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₵${((stats.totalRevenue || 0) / 100).toLocaleString()}`}
              icon={<AttachMoney />}
              color="#10b981"
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders || 0}
              icon={<ShoppingCart />}
              color="#6366f1"
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Customers"
              value={stats.totalUsers || 0}
              icon={<People />}
              color="#e94560"
              trend={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Order Value"
              value={`₵${((stats.averageOrderValue || 0) / 100).toFixed(2)}`}
              icon={<TrendingUp />}
              color="#f59e0b"
              trend={-3}
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3}>
          {/* Orders by Status */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Orders by Status
              </Typography>
              {statusChartData.length > 0 ? (
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No order data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Status Breakdown Pie */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Status Breakdown
              </Typography>
              {statusChartData.length > 0 ? (
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Top Products & Recent Orders */}
        <Grid container spacing={3}>
          {/* Top Products */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Selling Products
              </Typography>
              {topProducts.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {topProducts.slice(0, 5).map((product: any, idx: number) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.variantName}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${product.quantity} sold`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(product.quantity / (topProducts[0]?.quantity || 1)) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: COLORS[idx % COLORS.length],
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No product data available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Status Summary
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {ordersByStatus.map((item: any, idx: number) => (
                  <Grid item xs={6} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: alpha(getStatusColor(item.status), 0.1),
                        border: `1px solid ${alpha(getStatusColor(item.status), 0.2)}`,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getStatusColor(item.status),
                          width: 40,
                          height: 40,
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        {getStatusIcon(item.status)}
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>
                        {item.count || item._count?.id || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.status.replace(/_/g, ' ')}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AdminLayout>
  )
}
