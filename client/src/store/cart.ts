import create from 'zustand'
import api from '../api/axios'

type CartItem = { variantId: string; quantity: number }

type State = { items: CartItem[]; setItems: (items: CartItem[]) => void; add: (item: CartItem) => Promise<void>; remove: (variantId: string) => Promise<void>; update: (variantId: string, qty: number) => Promise<void>; clear: () => Promise<void> }

const useCart = create<State>((set,get)=>({
  items: [],
  setItems(items){
    set({ items })
  },
  async add(item){
    const items = get().items.slice()
    const idx = items.findIndex(i=>i.variantId===item.variantId)
    if (idx>=0) items[idx].quantity += item.quantity
    else items.push(item)
    try{
      const res = await api.put('/cart', { items })
      const cart = res.data.cart
      const serverItems = (cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      set({ items: serverItems })
    }catch(e){
      set({ items })
    }
  },
  async remove(variantId){
    const items = get().items.filter(i=>i.variantId!==variantId)
    try{
      const res = await api.put('/cart', { items })
      const cart = res.data.cart
      const serverItems = (cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      set({ items: serverItems })
    }catch(e){
      set({ items })
    }
  },
  async update(variantId, qty){
    const items = get().items.slice()
    const idx = items.findIndex(i=>i.variantId===variantId)
    if (idx>=0){ items[idx].quantity = qty }
    try{
      const res = await api.put('/cart', { items })
      const cart = res.data.cart
      const serverItems = (cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      set({ items: serverItems })
    }catch(e){
      set({ items })
    }
  },
  async clear(){
    try{
      const res = await api.put('/cart', { items: [] })
      const cart = res.data.cart
      const serverItems = (cart.items||[]).map((it:any)=>({ variantId: it.variantId, quantity: it.quantity }))
      set({ items: serverItems })
    }catch(e){
      set({ items: [] })
    }
  }
}))

export default useCart
