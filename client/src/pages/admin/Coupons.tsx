import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

export default function Coupons() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:coupons'], async () => {
    const res = await api.get('/admin/coupons')
    return res.data.coupons || []
  })

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/coupons/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin:coupons'])
        toast.success('Coupon deleted')
      },
      onError: () => {
        toast.error('Failed to delete coupon')
      }
    }
  )

  const coupons = data || []

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Coupons</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + New Coupon
          </button>
        </div>

        {isLoading ? (
          <div>Loading coupons...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Code</th>
                  <th className="p-3 text-left text-sm font-medium">Type</th>
                  <th className="p-3 text-left text-sm font-medium">Value</th>
                  <th className="p-3 text-left text-sm font-medium">Expiry</th>
                  <th className="p-3 text-left text-sm font-medium">Max Uses</th>
                  <th className="p-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No coupons found. Create your first coupon!
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon: any) => (
                    <tr key={coupon.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{coupon.code}</td>
                      <td className="p-3 text-sm capitalize">{coupon.type}</td>
                      <td className="p-3 text-sm">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₵${(coupon.value / 100).toFixed(2)}`}
                      </td>
                      <td className="p-3 text-sm">
                        {coupon.expiry ? new Date(coupon.expiry).toLocaleDateString() : 'No expiry'}
                      </td>
                      <td className="p-3 text-sm">{coupon.maxUses || 'Unlimited'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteMutation.mutate(coupon.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showCreateModal && (
          <CouponForm
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries(['admin:coupons'])
              setShowCreateModal(false)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

function CouponForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    expiry: '',
    maxUses: ''
  })

  const createMutation = useMutation(
    (data: any) => api.post('/admin/coupons', data),
    {
      onSuccess: () => {
        toast.success('Coupon created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to create coupon')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: formData.type === 'percentage' ? parseInt(formData.value) : parseInt(formData.value) * 100,
      expiry: formData.expiry || null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Coupon</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
              className="w-full border p-2 rounded"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Value * {formData.type === 'percentage' ? '(%)' : '(₵)'}
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full border p-2 rounded"
              min="0"
              max={formData.type === 'percentage' ? '100' : undefined}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date (optional)</label>
            <input
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Uses (optional)</label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="w-full border p-2 rounded"
              min="1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

