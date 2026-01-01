import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

export default function Brands() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:brands'], async () => {
    const res = await api.get('/admin/brands')
    return res.data.brands || []
  })

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/brands/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['brands'])
        toast.success('Brand deleted')
      },
      onError: () => {
        toast.error('Failed to delete brand')
      }
    }
  )

  const brands = data || []

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Brands</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + New Brand
          </button>
        </div>

        {isLoading ? (
          <div>Loading brands...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Name</th>
                  <th className="p-3 text-left text-sm font-medium">Slug</th>
                  <th className="p-3 text-left text-sm font-medium">Products</th>
                  <th className="p-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand: any) => (
                  <tr key={brand.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{brand.name}</td>
                    <td className="p-3 text-sm text-gray-500">{brand.slug}</td>
                    <td className="p-3 text-sm">{brand.products?.length || 0}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingBrand(brand)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this brand?')) {
                              deleteMutation.mutate(brand.id)
                            }
                          }}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(showCreateModal || editingBrand) && (
          <BrandForm
            brand={editingBrand}
            onClose={() => {
              setShowCreateModal(false)
              setEditingBrand(null)
            }}
            onSuccess={() => {
              queryClient.invalidateQueries(['brands'])
              setShowCreateModal(false)
              setEditingBrand(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

function BrandForm({ brand, onClose, onSuccess }: { brand?: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    slug: brand?.slug || ''
  })

  const createMutation = useMutation(
    (data: any) => api.post('/admin/brands', data),
    {
      onSuccess: () => {
        toast.success('Brand created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to create brand')
      }
    }
  )

  const updateMutation = useMutation(
    (data: any) => api.put(`/admin/brands/${brand?.id}`, data),
    {
      onSuccess: () => {
        toast.success('Brand updated successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update brand')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brand) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{brand ? 'Edit Brand' : 'Create Brand'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData({
                  name,
                  slug: brand ? formData.slug : name.toLowerCase().replace(/\s+/g, '-')
                })
              }}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full border p-2 rounded"
              required
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
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : (brand ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

