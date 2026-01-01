import React from 'react'
import useCart from '../store/cart'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function Cart(){
  const items = useCart(state=>state.items)
  const update = useCart(state=>state.update)
  const remove = useCart(state=>state.remove)
  const clear = useCart(state=>state.clear)
  const navigate = useNavigate()

  const ids = items.map(i=>i.variantId)
  const { data, isLoading } = useQuery(['variants', ids], async ()=>{
    if (ids.length===0) return { variants: [] }
    const res = await api.get(`/variants?ids=${ids.join(',')}`)
    return res.data
  }, { enabled: ids.length>0 })

  const subtotal = (data?.variants || []).reduce((s:any,v:any)=>{
    const qty = items.find((it:any)=>it.variantId===v.id)?.quantity || 0
    const price = (v.price - (v.discount||0))
    return s + price * qty
  }, 0)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Cart</h1>
      {items.length===0 ? (
        <div className="p-6 bg-white rounded shadow">Your cart is empty. <Link className="text-indigo-600" to="/shop">Shop now</Link></div>
      ) : (
        <div className="space-y-3">
          {isLoading ? <div>Loading cart...</div> : items.map(it=>{
            const v = data?.variants?.find((x:any)=>x.id===it.variantId)
            return (
              <div key={it.variantId} className="bg-white p-4 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">{v ? v.product.name + ' — ' + v.name : `Variant ${it.variantId}`}</div>
                  <div className="text-sm text-gray-500">Quantity: <input className="w-12 ml-2 border p-1" type="number" value={it.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>update(it.variantId, Number(e.target.value))} /></div>
                </div>
                <div className="text-right">
                  {v && <div className="font-medium">₵{((v.price - (v.discount||0))/100*it.quantity).toFixed(2)}</div>}
                  <div><button onClick={()=>remove(it.variantId)} className="text-sm text-red-500">Remove</button></div>
                </div>
              </div>
            )
          })}
          <div className="flex justify-between items-center">
            <button onClick={()=>{clear();}} className="text-sm text-gray-600">Clear cart</button>
            <button onClick={()=>navigate('/checkout')} className="bg-indigo-600 text-white px-4 py-2 rounded">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  )
}
