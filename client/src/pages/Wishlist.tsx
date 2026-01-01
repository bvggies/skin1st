import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useCart from '../store/cart'

export default function Wishlist() {
  const { user } = useAuth()
  const cart = useCart()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['wishlist'], async () => {
    const res = await api.get('/wishlist')
    return res.data.items || []
  }, { enabled: !!user })

  const removeMutation = useMutation(
    (productId: string) => api.delete(`/wishlist/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist'])
        toast.success('Removed from wishlist')
      }
    }
  )

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Please log in to view your wishlist</h2>
        <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading wishlist...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-4">Start adding products you love!</p>
        <Link to="/shop" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-block">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item: any) => {
          const product = item.product
          const minPrice = product.variants && product.variants.length > 0
            ? Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
            : 0

          return (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <Link to={`/product/${product.slug}`} className="block">
                <div className="relative">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/400x300'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {product.isNew && (
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm mb-1">{product.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{product.brand?.name}</div>
                  {minPrice > 0 && (
                    <div className="text-sm font-semibold text-indigo-600">From ₵{minPrice.toFixed(2)}</div>
                  )}
                </div>
              </Link>
              <div className="p-3 pt-0 flex gap-2">
                <button
                  onClick={() => {
                    const variantId = product.variants?.[0]?.id
                    if (variantId) {
                      cart.add({ variantId, quantity: 1 })
                      toast.success('Added to cart')
                    }
                  }}
                  className="flex-1 bg-indigo-600 text-white text-sm px-3 py-2 rounded hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeMutation.mutate(product.id)}
                  className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

