import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'

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

  // Dynamically load recharts to avoid build issues
  const renderChart = () => {
    if (!ordersByStatus || !Array.isArray(ordersByStatus) || ordersByStatus.length === 0) {
      return <p className="text-gray-500">No data available</p>
    }

    try {
      // Use require to avoid build-time import issues
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = require('recharts')
      
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
    } catch (e) {
      // Fallback to table if recharts fails
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-4">Chart unavailable. Showing as table:</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Status</th>
                <th className="text-right p-2 font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {ordersByStatus.map((item: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{item.status}</td>
                  <td className="text-right p-2">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

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
          {renderChart()}
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
