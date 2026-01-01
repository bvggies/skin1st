import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SkeletonCard from '../components/SkeletonCard'
import { motion, AnimatePresence } from 'framer-motion'

export default function Shop(){
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [sort, setSort] = useState<string>('')
  const [perPage] = useState(12)

  const { data: categories } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: brands } = useQuery(['brands'], async () => {
    const res = await api.get('/brands')
    return res.data.brands || []
  })

  const { data, isLoading } = useQuery(['products', page, search, selectedCategory, selectedBrand, sort], async ()=>{
    const qs = []
    if (search) qs.push(`search=${encodeURIComponent(search)}`)
    if (selectedCategory) qs.push(`category=${encodeURIComponent(selectedCategory)}`)
    if (selectedBrand) qs.push(`brand=${encodeURIComponent(selectedBrand)}`)
    if (sort) qs.push(`sort=${encodeURIComponent(sort)}`)
    qs.push(`page=${page}`)
    qs.push(`perPage=${perPage}`)
    const res = await api.get(`/products?${qs.join('&')}`)
    return res.data
  })

  const products = data?.products || []
  const total = data?.meta?.total || 0
  const pages = Math.max(1, Math.ceil(total / perPage))

  const gridItems = useMemo(()=> products, [products])

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSort('')
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = selectedCategory || selectedBrand || sort || search

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <div className="w-full md:w-64">
          <SearchBar value={search} onChange={(v)=>{ setPage(1); setSearch(v) }} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
              className="w-full border p-2 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1) }}
              className="w-full border p-2 rounded-lg text-sm"
            >
              <option value="">All Brands</option>
              {brands?.map((brand: any) => (
                <option key={brand.id} value={brand.slug}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="w-full border p-2 rounded-lg text-sm"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {((page - 1) * perPage) + 1} - {Math.min(page * perPage, total)} of {total} products
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({length:12}).map((_,i)=> <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gridItems.map((p:any)=> {
              const minPrice = p.variants && p.variants.length > 0 
                ? Math.min(...p.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
                : 0
              return (
                <motion.div layout key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <Link to={`/product/${p.slug}`} className="bg-white rounded-lg shadow p-3 block hover:shadow-lg transition">
                    <div className="relative">
                      <img src={p.images?.[0]?.url||'https://placehold.co/400x300'} alt={p.name} className="w-full h-40 object-cover rounded"/>
                      {p.isNew && <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">New</div>}
                      {p.isBestSeller && <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Best Seller</div>}
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">{p.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.brand?.name}</div>
                      {minPrice > 0 && (
                        <div className="text-sm font-semibold text-indigo-600">From ₵{minPrice.toFixed(2)}</div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button 
            disabled={page<=1} 
            onClick={()=>setPage(p=>Math.max(1,p-1))} 
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="text-sm px-4">Page {page} of {pages}</span>
          <button 
            disabled={page>=pages} 
            onClick={()=>setPage(p=>Math.min(p+1,pages))} 
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
