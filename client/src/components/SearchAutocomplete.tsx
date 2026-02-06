import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material'
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
      const res = await api.get(`/products?search=${encodeURIComponent(query)}&perPage=5&adult=false`)
      return res.data
    },
    { enabled: query.length >= 2, staleTime: 60 * 1000 } // 1 min — same query not refetched
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
      setSelectedIndex((prev) => Math.min(prev + 1, products.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && products[selectedIndex]) {
      e.preventDefault()
      handleSelect(products[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const minPrice = (product: any) => {
    if (!product.variants || product.variants.length === 0) return 0
    return Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
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
        size="small"
        fullWidth
      />

      {showResults && query.length >= 2 && (
        <Paper
          sx={{
            position: 'absolute',
            zIndex: 1300,
            width: '100%',
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No products found
              </Typography>
            </Box>
          ) : (
            <>
              <List dense>
                {products.map((product: any, idx: number) => (
                  <ListItem
                    key={product.id}
                    disablePadding
                    sx={{
                      bgcolor: idx === selectedIndex ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemButton onClick={() => handleSelect(product)}>
                      <ListItemAvatar>
                        <Avatar
                          src={product.images?.[0]?.url || 'https://placehold.co/60x60'}
                          alt={product.name}
                          variant="rounded"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {product.brand?.name}
                            </Typography>
                            {minPrice(product) > 0 && (
                              <Typography variant="caption" color="primary" sx={{ display: 'block', fontWeight: 600 }}>
                                From ₵{minPrice(product).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {query && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(query)}`)
                      setShowResults(false)
                    }}
                  >
                    <ListItemText
                      primary={`View all results for "${query}"`}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'primary',
                        sx: { textAlign: 'center' },
                      }}
                    />
                  </ListItemButton>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}
