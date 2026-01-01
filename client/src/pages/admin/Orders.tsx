import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, exportOrdersCsv } from '../../api/admin'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

export default function Orders(){
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)
  const [status, setStatus] = React.useState<string | undefined>(undefined)
  const [q, setQ] = React.useState('')

  const { data, isLoading } = useQuery(['admin:orders', page, pageSize, status, q], ()=>getOrders({ page, pageSize, status, q }), { keepPreviousData: true })
  const navigate = useNavigate()

  if (isLoading) return <AdminLayout><div>Loading orders...</div></AdminLayout>

  const orders = data?.orders || []
  const meta = data?.meta || { page, pageSize, total: 0 }
  const totalPages = Math.ceil((meta.total||0)/meta.pageSize || 1)

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <div className="flex gap-2">
            <input placeholder="Search" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1) }} className="border p-2 rounded" />
            <select value={status||''} onChange={(e)=>{ setStatus(e.target.value || undefined); setPage(1) }} className="border p-2 rounded">
              <option value="">All statuses</option>
              <option value="PENDING_CONFIRMATION">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="OUT_FOR_DELIVERY">Out for delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <button onClick={async ()=>{
              try{
                const blob = await (async()=>{
                  const b = await exportOrdersCsv({ page, pageSize, status, q })
                  return b
                })()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `orders_${Date.now()}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
              }catch(e){ console.error(e) }
            }} className="px-3 py-1 bg-gray-200 rounded">Export CSV</button>
          </div>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o:any)=> (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.code}</td>
                <td className="p-2">{o.user?.name || o.user?.email || 'Guest'}</td>
                <td className="p-2">₵{(o.total/100).toFixed(2)}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2"><button onClick={()=>navigate(`/admin/orders/${o.id}`)} className="text-indigo-600">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between">
          <div>Showing page {meta.page} of {totalPages} — {meta.total} orders</div>
          <div className="flex gap-2">
            <button disabled={meta.page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded">Prev</button>
            <button disabled={meta.page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}