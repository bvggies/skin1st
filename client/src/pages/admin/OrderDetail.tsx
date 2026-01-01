import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrder, updateOrderStatus } from '../../api/admin'
import AdminLayout from '../../components/AdminLayout'

export default function OrderDetail(){
  const { id } = useParams()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery(['admin:order', id], ()=>getOrder(id as string), { enabled: !!id })
  const mutation = useMutation((status:string)=>updateOrderStatus(id as string, status), {
    onSuccess: ()=> qc.invalidateQueries(['admin:orders'])
  })

  if (isLoading) return <AdminLayout><div>Loading order...</div></AdminLayout>
  const order = data?.order
  const events = data?.events || []
  if (!order) return <AdminLayout><div>Order not found</div></AdminLayout>

  const onChangeStatus = (status:string)=> mutation.mutate(status)

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Order {order.code}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-gray-50 p-3 rounded">
            <div className="font-medium">Customer</div>
            <div>{order.user?.name || order.user?.email || 'Guest'}</div>
            <div className="mt-2 font-medium">Delivery Address</div>
            <div>{order.deliveryAddr}</div>

            <div className="mt-4">
              <h3 className="font-medium">Items</h3>
              <div className="space-y-2 mt-2">
                {order.items.map((it:any)=> (
                  <div key={it.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                    <div>{it.variant.name} x {it.quantity}</div>
                    <div>₵{(it.unitPrice/100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">Total</div>
            <div>₵{(order.total/100).toFixed(2)}</div>
            <div className="mt-2 font-medium">Status</div>
            <div>{order.status}</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>onChangeStatus('CONFIRMED')}>Confirm</button>
              <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={()=>onChangeStatus('OUT_FOR_DELIVERY')}>Out for delivery</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>onChangeStatus('DELIVERED')}>Delivered</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>onChangeStatus('CANCELLED')}>Cancel</button>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Timeline</h3>
              <div className="space-y-2">
                {events.map((ev:any)=> (
                  <div key={ev.id} className="p-2 bg-white rounded shadow-sm">
                    <div className="text-sm text-gray-500">{new Date(ev.createdAt).toLocaleString()}</div>
                    <div className="font-medium">{ev.type}</div>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(ev.payload, null, 2)}</pre>
                  </div>
                ))}
                {events.length===0 && <div className="text-sm text-gray-500">No events yet</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}