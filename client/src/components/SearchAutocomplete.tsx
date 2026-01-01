import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface SearchAutocompleteProps {
  onSelect?: (product: any) => void
}

export default function SearchAutocomplete({ onSelect }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery(
    ['products', 'search', query],
    async () => {
      if (!query || query.length < 2) return { products: [] }
      const res = await api.get(`/products?search=${encodeURIComponent(query)}&perPage=5`)
      return res.data
    },
    { enabled: query.length >= 2 }
  )

  const products = data?.products || []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (product: any) => {
    if (onSelect) {
      onSelect(product)
    } else {
      navigate(`/product/${product.slug}`)
    }
    setQuery('')
    setShowResults(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, products.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && products[selectedIndex]) {
      e.preventDefault()
      handleSelect(products[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowResults(true)
          setSelectedIndex(-1)
        }}
        onFocus={() => setShowResults(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />

      {showResults && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No products found</div>
          ) : (
            <>
              {products.map((product: any, idx: number) => {
                const minPrice = product.variants && product.variants.length > 0
                  ? Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
                  : 0

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 ${
                      idx === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/60x60'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.brand?.name}</div>
                      {minPrice > 0 && (
                        <div className="text-xs text-indigo-600 font-semibold">From ₵{minPrice.toFixed(2)}</div>
                      )}
                    </div>
                  </button>
                )
              })}
              {query && (
                <div className="border-t p-2">
                  <button
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(query)}`)
                      setShowResults(false)
                    }}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 py-2"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

