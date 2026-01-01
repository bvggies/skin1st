import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'

export default function Users() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 20

  const { data, isLoading } = useQuery(['admin:users', page, search], async () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (search) params.set('q', search)
    const res = await api.get(`/admin/users?${params.toString()}`)
    return res.data
  })

  const users = data?.users || []
  const total = data?.meta?.total || 0

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users</h2>
          <div className="flex gap-2">
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="border p-2 rounded"
            />
          </div>
        </div>

        {isLoading ? (
          <div>Loading users...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Email</th>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Phone</th>
                    <th className="p-3 text-left text-sm font-medium">Role</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        No users found. User management endpoint needs to be implemented.
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-sm">{user.email}</td>
                        <td className="p-3 text-sm">{user.name || '-'}</td>
                        <td className="p-3 text-sm">{user.phone || '-'}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} users
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
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

