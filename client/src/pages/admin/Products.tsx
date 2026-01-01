import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ProductForm from '../../components/admin/ProductForm'

export default function Products() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const pageSize = 20
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:products', page, search], async () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('perPage', String(pageSize))
    if (search) params.set('search', search)
    const res = await api.get(`/products?${params.toString()}`)
    return res.data
  })

  const products = data?.products || []
  const total = data?.meta?.total || 0

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="flex gap-2">
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="border p-2 rounded"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              + New Product
            </button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading products...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Brand</th>
                    <th className="p-3 text-left text-sm font-medium">Category</th>
                    <th className="p-3 text-left text-sm font-medium">Variants</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.slug}</div>
                      </td>
                      <td className="p-3 text-sm">{p.brand?.name || '-'}</td>
                      <td className="p-3 text-sm">{p.category?.name || '-'}</td>
                      <td className="p-3 text-sm">{p.variants?.length || 0} variants</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {p.isNew && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">New</span>}
                          {p.isBestSeller && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Best</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            className="text-indigo-600 hover:underline text-sm"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} products
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {(showCreateModal || editingProduct) && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowCreateModal(false)
              setEditingProduct(null)
            }}
            onSuccess={() => {
              queryClient.invalidateQueries(['admin:products'])
              setShowCreateModal(false)
              setEditingProduct(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

