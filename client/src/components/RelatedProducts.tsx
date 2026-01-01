import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function RelatedProducts({ productId, categorySlug }: { productId: string; categorySlug?: string }){
  const { data, isLoading } = useQuery(['related', productId], async ()=>{
    const res = await api.get(`/products/related?category=${encodeURIComponent(categorySlug||'')}`)
    return res.data.products
  }, { enabled: !!categorySlug })

  if (isLoading) return <div>Loading related...</div>
  if (!data || data.length===0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Related products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((p:any)=> (
          <Link key={p.id} to={`/product/${p.slug}`} className="bg-white rounded p-2 shadow">
            <img src={p.images?.[0]?.url||'https://placehold.co/200x150'} alt={p.name} className="w-full h-24 object-cover rounded mb-2" />
            <div className="text-sm font-medium">{p.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
