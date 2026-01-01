import api from './axios'

export async function login(email: string, password: string, cart?: { variantId: string; quantity: number }[]) {
  const res = await api.post('/auth/login', { email, password, cart })
  return res.data
}

export async function register(payload: { email: string; password: string; name?: string; phone?: string; cart?: { variantId: string; quantity: number }[] }) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function logout(){
  // best-effort; backend logout endpoint not required for client-side clearing
  try{ await api.post('/auth/logout') }catch(e){}
}

export async function mergeGuestCart(items: { variantId: string; quantity: number }[]) {
  const res = await api.post('/cart.merge', { items })
  return res.data
}
