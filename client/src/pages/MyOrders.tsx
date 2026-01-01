import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const statusColors: Record<string, string> = {
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  PAID: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Pending Confirmation',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export default function MyOrders() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery(['my-orders'], async () => {
    const res = await api.get('/orders/my')
    return res.data.orders || []
  }, { enabled: !!user })

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Please log in to view your orders</h2>
        <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading your orders...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
        <Link to="/shop" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-block">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      <div className="space-y-4">
        {data.map((order: any) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Order {order.code}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-indigo-600">₵{(order.total / 100).toFixed(2)}</div>
                <div className="flex gap-2 mt-2 justify-end">
                  <Link 
                    to={`/orders/track?code=${order.code}`} 
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Track
                  </Link>
                  <a
                    href={`/api/orders/${order.id}/invoice?code=${order.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Invoice
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.variant?.name || 'Product'}</span>
                      <span className="text-gray-600 ml-2">× {item.quantity}</span>
                    </div>
                    <div className="text-gray-600">₵{(item.unitPrice / 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {order.deliveryAddr && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm">
                  <span className="font-medium">Delivery Address:</span>
                  <div className="text-gray-600 mt-1">{order.deliveryAddr}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

