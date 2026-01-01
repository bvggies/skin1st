import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import SkeletonCard from '../components/SkeletonCard'
import { motion } from 'framer-motion'

export default function Home(){
  const { data: featured, isLoading: featuredLoading } = useQuery(['products', 'featured'], async () => {
    const res = await api.get('/products?perPage=8')
    return res.data.products
  })

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery(['products', 'bestsellers'], async () => {
    const res = await api.get('/products?perPage=4')
    const products = res.data.products || []
    return products.filter((p: any) => p.isBestSeller).slice(0, 4)
  })

  const { data: newProducts, isLoading: newProductsLoading } = useQuery(['products', 'new'], async () => {
    const res = await api.get('/products?perPage=4')
    const products = res.data.products || []
    return products.filter((p: any) => p.isNew).slice(0, 4)
  })

  return (
    <div>
      <section className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-lg p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-3">Skin1st Beauty Therapy</h1>
          <p className="text-lg text-gray-700 mb-4">Premium beauty and skin therapy products — COD, 1–3 day delivery, money-back guarantee.</p>
          <div className="flex gap-3">
            <Link to="/shop" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">Shop Now</Link>
            <a href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I want to order')}`} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">Contact WhatsApp</a>
          </div>
        </div>
      </section>

      {bestSellers && bestSellers.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Best Sellers</h2>
            <Link to="/shop" className="text-indigo-600 hover:underline">View all →</Link>
          </div>
          {bestSellersLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({length: 4}).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map((p: any) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Link to={`/product/${p.slug}`} className="bg-white rounded-lg shadow hover:shadow-lg transition block overflow-hidden">
                    <div className="relative">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/400x300'} alt={p.name} className="w-full h-48 object-cover"/>
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Best Seller</div>
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm mb-1">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.brand?.name}</div>
                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-2 text-sm font-semibold text-indigo-600">
                          From ₵{((Math.min(...p.variants.map((v: any) => v.price - (v.discount || 0))) / 100).toFixed(2))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {newProducts && newProducts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">New Arrivals</h2>
            <Link to="/shop" className="text-indigo-600 hover:underline">View all →</Link>
          </div>
          {newProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({length: 4}).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.map((p: any) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Link to={`/product/${p.slug}`} className="bg-white rounded-lg shadow hover:shadow-lg transition block overflow-hidden">
                    <div className="relative">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/400x300'} alt={p.name} className="w-full h-48 object-cover"/>
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">New</div>
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm mb-1">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.brand?.name}</div>
                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-2 text-sm font-semibold text-indigo-600">
                          From ₵{((Math.min(...p.variants.map((v: any) => v.price - (v.discount || 0))) / 100).toFixed(2))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Link to="/shop" className="text-indigo-600 hover:underline">View all →</Link>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured?.slice(0, 8).map((p: any) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Link to={`/product/${p.slug}`} className="bg-white rounded-lg shadow hover:shadow-lg transition block overflow-hidden">
                  <div className="relative">
                    <img src={p.images?.[0]?.url || 'https://placehold.co/400x300'} alt={p.name} className="w-full h-48 object-cover"/>
                    {p.isNew && <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">New</div>}
                    {p.isBestSeller && <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Best Seller</div>}
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm mb-1">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.brand?.name}</div>
                    {p.variants && p.variants.length > 0 && (
                      <div className="mt-2 text-sm font-semibold text-indigo-600">
                        From ₵{((Math.min(...p.variants.map((v: any) => v.price - (v.discount || 0))) / 100).toFixed(2))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🚚</div>
            <div className="font-medium mb-1">Fast Delivery</div>
            <div className="text-sm text-gray-600">1-3 day delivery across Ghana</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-medium mb-1">Cash on Delivery</div>
            <div className="text-sm text-gray-600">Pay when you receive your order</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-medium mb-1">Money-Back Guarantee</div>
            <div className="text-sm text-gray-600">100% satisfaction guaranteed</div>
          </div>
        </div>
      </section>
    </div>
  )
}
