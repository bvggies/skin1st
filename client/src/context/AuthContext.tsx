import React from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import useCart from '../store/cart'
import api from '../api/axios'
import { setAccessToken, clearAccessToken } from '../api/authClient'

type User = { id: string; email: string; name?: string; role?: string } | null

const AuthContext = React.createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [user, setUser] = React.useState<User>(null)
  const navigate = useNavigate()
  const cartStore = useCart()

  React.useEffect(()=>{
    // try to refresh access token using HttpOnly refresh cookie, then fetch user and cart
    (async ()=>{
      try{
        const r = await api.post('/auth.refresh')
        const accessToken = r.data.accessToken
        if (accessToken) setAccessToken(accessToken)
        // fetch user
        const me = await api.get('/auth.me')
        setUser(me.data.user)
        // fetch cart (server will return guest or user cart)
        const cartRes = await api.get('/cart')
        const items = (cartRes.data.cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
        cartStore.setItems(items)
      }catch(e){ 
        // Silently ignore auth errors (user not logged in)
        // 405 is expected if no refresh token exists
      }
    })()
  }, [])

  async function login(email:string, password:string){
    const res = await apiLogin(email, password)
    const { accessToken, user: u } = res
    if (accessToken) setAccessToken(accessToken)
    if (u) setUser(u)

    // fetch merged cart from server
    try{
      const cartRes = await api.get('/cart')
      const items = (cartRes.data.cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      cartStore.setItems(items)
    }catch(e){ /* ignore */ }

    return res
  }

  async function register(payload:{ email:string; password:string; name?:string; phone?:string }){
    const res = await apiRegister(payload)
    const { accessToken, user: u } = res
    if (accessToken) setAccessToken(accessToken)
    if (u) setUser(u)

    try{
      const cartRes = await api.get('/cart')
      const items = (cartRes.data.cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      cartStore.setItems(items)
    }catch(e){ /* ignore */ }

    return res
  }

  async function logout(){
    try{ await api.post('/auth.logout') }catch(e){}
    clearAccessToken()
    setUser(null)
    // fetch guest cart created on logout (if any)
    try{
      const cartRes = await api.get('/cart')
      const items = (cartRes.data.cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      cartStore.setItems(items)
    }catch(e){ cartStore.setItems([]) }
    navigate('/')
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(){ const ctx = React.useContext(AuthContext); if(!ctx) throw new Error('useAuth must be used inside AuthProvider'); return ctx }
