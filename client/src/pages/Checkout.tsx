import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useCart from '../store/cart'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Schema = z.object({ name: z.string().min(1), phone: z.string().min(5), deliveryAddr: z.string().min(5), deliveryNotes: z.string().optional() })

type Form = z.infer<typeof Schema>

export default function Checkout(){
  const cart = useCart()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<Form>({ resolver: zodResolver(Schema) })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

  // Fetch variant details for cart items
  const variantIds = cart.items.map(i => i.variantId)
  const { data: variantsData } = useQuery(['variants', variantIds], async () => {
    if (variantIds.length === 0) return { variants: [] }
    const res = await api.get(`/variants?ids=${variantIds.join(',')}`)
    return res.data
  }, { enabled: variantIds.length > 0 })

  const subtotal = (variantsData?.variants || []).reduce((s: any, v: any) => {
    const qty = cart.items.find((it: any) => it.variantId === v.id)?.quantity || 0
    const price = (v.price - (v.discount || 0))
    return s + price * qty
  }, 0)

  const discount = appliedCoupon?.discount || 0
  const total = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    try {
      const res = await api.post('/coupons.validate', { code: couponCode, total: subtotal })
      setAppliedCoupon(res.data)
      setCouponError('')
      toast.success('Coupon applied successfully!')
    } catch (e: any) {
      setCouponError(e.response?.data?.error || 'Invalid coupon code')
      setAppliedCoupon(null)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  async function onSubmit(data: Form){
    if (cart.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try{
      const items = cart.items.map(i=>({ variantId: i.variantId, quantity: i.quantity }))
      const res = await api.post('/orders', { 
        ...data, 
        items,
        coupon: appliedCoupon?.coupon?.code || undefined
      })
      toast.success(`Order placed successfully! Order code: ${res.data.order.code}`)
      cart.clear()
      navigate(`/orders/track?code=${res.data.order.code}`)
    }catch(e:any){ 
      console.error(e)
      const errorMsg = e.response?.data?.error || 'Failed to place order'
      toast.error(errorMsg)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg shadow p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full name *</label>
            <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" {...register('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone *</label>
            <input type="tel" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" {...register('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Delivery address *</label>
            <textarea rows={3} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" {...register('deliveryAddr')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Delivery notes (optional)</label>
            <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" {...register('deliveryNotes')} />
            <p className="text-xs text-gray-500 mt-1">Any special instructions for delivery</p>
          </div>
        </form>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            {cart.items.map((item: any) => {
              const variant = variantsData?.variants?.find((v: any) => v.id === item.variantId)
              if (!variant) return null
              const price = (variant.price - (variant.discount || 0)) / 100
              return (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{variant.product?.name || 'Product'}</div>
                    <div className="text-gray-500">{variant.name} × {item.quantity}</div>
                  </div>
                  <div className="font-medium">₵{(price * item.quantity).toFixed(2)}</div>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 border p-2 rounded-lg text-sm"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Coupon {appliedCoupon.coupon.code} applied! Save ₵{(appliedCoupon.discount / 100).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₵{(subtotal / 100).toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon.coupon.code})</span>
                <span>-₵{(discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-indigo-600">₵{(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="w-full mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Place Order (COD)
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            You'll pay when you receive your order
          </p>
        </div>
      </div>
    </div>
  )
}
