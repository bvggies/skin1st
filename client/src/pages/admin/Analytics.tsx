import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Analytics() {
  const [period, setPeriod] = React.useState('30')

  const { data, isLoading } = useQuery(['admin:analytics', period], async () => {
    const res = await api.get(`/admin/analytics?period=${period}`)
    return res.data
  })

  if (isLoading) {
    return <AdminLayout><div>Loading analytics...</div></AdminLayout>
  }

  const stats = data?.stats || {}
  const ordersByStatus = data?.ordersByStatus || []
  const topProducts = data?.topProducts || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold">₵{((stats.totalRevenue || 0) / 100).toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Average Order Value</div>
            <div className="text-2xl font-bold">₵{((stats.averageOrderValue || 0) / 100).toFixed(2)}</div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          {ordersByStatus && ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Top Products</h3>
          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.variantName}</div>
                  </div>
                  <div className="font-semibold">{product.quantity} sold</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

