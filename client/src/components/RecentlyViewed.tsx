import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

const STORAGE_KEY = 'recently_viewed_products'
const MAX_ITEMS = 8

export default function RecentlyViewed() {
  const [productIds, setProductIds] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const ids = JSON.parse(stored)
        setProductIds(ids.slice(0, MAX_ITEMS))
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, [])

  const { data } = useQuery(
    ['products', 'recently-viewed', productIds],
    async () => {
      if (productIds.length === 0) return { products: [] }
      const res = await api.get(`/products?perPage=${MAX_ITEMS}`)
      const allProducts = res.data.products || []
      // Filter to only show products that are in recently viewed
      return {
        products: allProducts.filter((p: any) => productIds.includes(p.id))
      }
    },
    { enabled: productIds.length > 0 }
  )

  if (!productIds.length || !data?.products?.length) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.products.map((p: any) => {
          const minPrice = p.variants && p.variants.length > 0
            ? Math.min(...p.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
            : 0
          return (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition block overflow-hidden"
            >
              <div className="relative">
                <img
                  src={p.images?.[0]?.url || 'https://placehold.co/400x300'}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm mb-1">{p.name}</div>
                <div className="text-xs text-gray-500 mb-2">{p.brand?.name}</div>
                {minPrice > 0 && (
                  <div className="text-sm font-semibold text-indigo-600">From ₵{minPrice.toFixed(2)}</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Hook to track product views
export function useTrackProductView(productId: string | undefined) {
  useEffect(() => {
    if (!productId) return

    const stored = localStorage.getItem(STORAGE_KEY)
    let ids: string[] = []
    
    if (stored) {
      try {
        ids = JSON.parse(stored)
      } catch (e) {
        // Invalid JSON, start fresh
      }
    }

    // Remove if already exists, then add to front
    ids = ids.filter(id => id !== productId)
    ids.unshift(productId)
    
    // Keep only MAX_ITEMS
    ids = ids.slice(0, MAX_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [productId])
}

