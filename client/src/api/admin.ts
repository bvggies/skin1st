import api from './axios'

export async function getOrders(params?: { page?: number; pageSize?: number; status?: string; q?: string; from?: string; to?: string; userId?: string }){
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.pageSize) query.set('pageSize', String(params.pageSize))
  if (params?.status) query.set('status', params.status)
  if (params?.q) query.set('q', params.q)
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)
  if (params?.userId) query.set('userId', params.userId)

  const res = await api.get(`/admin/orders?${query.toString()}`)
  return res.data
}

export async function exportOrdersCsv(params?: { page?: number; pageSize?: number; status?: string; q?: string; from?: string; to?: string }){
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.pageSize) query.set('pageSize', String(params.pageSize))
  if (params?.status) query.set('status', params.status)
  if (params?.q) query.set('q', params.q)
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)
  query.set('format', 'csv')

  const res = await api.get(`/admin/orders?${query.toString()}`, { responseType: 'blob' })
  return res.data
}

export async function getOrder(id:string){
  const res = await api.get(`/admin/orders/${id}`)
  return res.data
}

export async function getOrderEvents(id:string){
  const res = await api.get(`/admin/orders/${id}`)
  return res.data.events
}

export async function updateOrderStatus(id:string, status:string){
  const res = await api.post(`/admin/orders/${id}/status`, { status })
  return res.data
}