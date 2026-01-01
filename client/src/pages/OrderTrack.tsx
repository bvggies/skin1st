import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { useSearchParams } from 'react-router-dom'

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

export default function OrderTrack() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [phone, setPhone] = useState('')
  const [trackingCode, setTrackingCode] = useState(code)

  const { data, isLoading, error, refetch } = useQuery(
    ['order-track', trackingCode, phone],
    async () => {
      const params = new URLSearchParams({ code: trackingCode })
      if (phone) params.set('phone', phone)
      const res = await api.get(`/orders/track?${params.toString()}`)
      return res.data.order
    },
    { enabled: !!trackingCode }
  )

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      setTrackingCode(code.trim())
      refetch()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Track Your Order</h1>

      <form onSubmit={handleTrack} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Order Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ORD-XXXXXXX"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For verification"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter your phone number for additional security</p>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Track Order
          </button>
        </div>
      </form>

      {isLoading && trackingCode && (
        <div className="bg-white rounded-lg shadow p-6 text-center">Loading order information...</div>
      )}

      {error && trackingCode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">
            {(error as any)?.response?.data?.error || 'Order not found. Please check your order code and try again.'}
          </p>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Order {data.code}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {new Date(data.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[data.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[data.status] || data.status}
            </span>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-medium mb-3">Order Items</h3>
            <div className="space-y-2">
              {data.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{item.variant?.name || 'Product'}</div>
                    <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₵{(item.unitPrice / 100).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">₵{((item.unitPrice * item.quantity) / 100).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-indigo-600">₵{(data.total / 100).toFixed(2)}</span>
            </div>
          </div>

          {data.deliveryAddr && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Delivery Address</h3>
              <p className="text-gray-700">{data.deliveryAddr}</p>
              {data.deliveryNotes && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Notes:</strong> {data.deliveryNotes}
                </p>
              )}
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Order Status Timeline</h3>
            <div className="space-y-2">
              {[
                { status: 'PENDING_CONFIRMATION', label: 'Order Placed' },
                { status: 'CONFIRMED', label: 'Order Confirmed' },
                { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                { status: 'DELIVERED', label: 'Delivered' },
                { status: 'PAID', label: 'Payment Received' },
                { status: 'COMPLETED', label: 'Order Completed' }
              ].map((step, index) => {
                const isActive = data.status === step.status
                const isPast = ['PENDING_CONFIRMATION', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID', 'COMPLETED'].indexOf(data.status) >= 
                  ['PENDING_CONFIRMATION', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID', 'COMPLETED'].indexOf(step.status)
                return (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isPast ? 'bg-green-500' : isActive ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                    <span className={isPast || isActive ? 'font-medium' : 'text-gray-500'}>{step.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

