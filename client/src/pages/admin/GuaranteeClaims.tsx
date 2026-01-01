import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800'
}

export default function GuaranteeClaims() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const pageSize = 20
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:guarantee-claims', page, status], async () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (status) params.set('status', status)
    const res = await api.get(`/admin/guarantee-claims?${params.toString()}`)
    return res.data
  })

  const updateMutation = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/guarantee-claims/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin:guarantee-claims'])
        toast.success('Claim status updated')
      },
      onError: () => {
        toast.error('Failed to update claim status')
      }
    }
  )

  const claims = data?.claims || []
  const total = data?.meta?.total || 0

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Guarantee Claims</h2>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="border p-2 rounded"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {isLoading ? (
          <div>Loading claims...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Order Code</th>
                    <th className="p-3 text-left text-sm font-medium">Customer</th>
                    <th className="p-3 text-left text-sm font-medium">Reason</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Submitted</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim: any) => (
                    <tr key={claim.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{claim.order?.code}</td>
                      <td className="p-3 text-sm">
                        {claim.order?.user?.name || claim.order?.user?.email || 'Guest'}
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate">{claim.reason}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded ${statusColors[claim.status] || 'bg-gray-100 text-gray-800'}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {claim.status === 'SUBMITTED' && (
                            <>
                              <button
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'UNDER_REVIEW' })}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'REJECTED' })}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {claim.status === 'UNDER_REVIEW' && (
                            <>
                              <button
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'APPROVED' })}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'REJECTED' })}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {claim.status === 'APPROVED' && (
                            <button
                              onClick={() => updateMutation.mutate({ id: claim.id, status: 'REFUNDED' })}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            >
                              Mark Refunded
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} claims
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

