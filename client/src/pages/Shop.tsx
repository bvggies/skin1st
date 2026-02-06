import React, { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Pagination,
  Stack,
  CircularProgress,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import SearchBar from '../components/SearchBar'
import SkeletonCard from '../components/SkeletonCard'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [sort, setSort] = useState<string>('')
  const [perPage] = useState(12)

  // Read URL params on mount and when they change
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Scroll to top when component mounts or filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, selectedCategory, selectedBrand, sort, search])

  const { data: categories } = useQuery(
    ['categories'],
    async () => {
      const res = await api.get('/categories')
      const filtered = (res.data.categories || []).filter((cat: any) => cat.slug !== 'adult-products')
      return filtered
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const { data: brands } = useQuery(
    ['brands'],
    async () => {
      const res = await api.get('/brands')
      return res.data.brands || []
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const { data, isLoading, error } = useQuery(
    ['products', page, search, selectedCategory, selectedBrand, sort],
    async () => {
      const qs = []
      if (search) qs.push(`search=${encodeURIComponent(search)}`)
      if (selectedCategory) qs.push(`category=${encodeURIComponent(selectedCategory)}`)
      if (selectedBrand) qs.push(`brand=${encodeURIComponent(selectedBrand)}`)
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`)
      qs.push(`page=${page}`)
      qs.push(`perPage=${perPage}`)
      qs.push(`adult=false`) // Exclude adult items from main shop
      const res = await api.get(`/products?${qs.join('&')}`)
      return res.data
    },
    {
      staleTime: 2 * 60 * 1000,
      onError: (error: any) => {
        console.error('Error fetching products:', error)
      }
    }
  )

  const products = data?.products || []
  const total = data?.meta?.total || 0
  const pages = Math.max(1, Math.ceil(total / perPage))

  const gridItems = useMemo(() => products, [products])

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSort('')
    setSearch('')
    setPage(1)
    setSearchParams(new URLSearchParams()) // Clear URL params
  }

  const hasActiveFilters = selectedCategory || selectedBrand || sort || search

  // Fixed dimensions for consistent card sizes
  const CARD_IMAGE_HEIGHT = 200
  const CARD_MIN_HEIGHT = 340

  const ProductCard = ({ product }: { product: any }) => {
    const minPrice =
      product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
        : 0
    const originalPrice =
      product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map((v: any) => v.price / 100))
        : 0
    const hasDiscount = minPrice < originalPrice

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ height: '100%' }}
      >
        <Card
          component={Link}
          to={`/product/${product.slug}`}
          sx={{
            height: CARD_MIN_HEIGHT,
            minHeight: CARD_MIN_HEIGHT,
            maxHeight: CARD_MIN_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <Box sx={{ position: 'relative', height: CARD_IMAGE_HEIGHT, minHeight: CARD_IMAGE_HEIGHT, bgcolor: 'grey.50' }}>
            <CardMedia
              component="img"
              image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'}
              alt={product.name}
              sx={{
                width: '100%',
                height: CARD_IMAGE_HEIGHT,
                objectFit: 'cover',
              }}
            />
            <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {product.isNew && (
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    bgcolor: '#1a1a2e',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                  }}
                />
              )}
              {product.isBestSeller && (
                <Chip
                  label="BEST SELLER"
                  size="small"
                  sx={{
                    bgcolor: '#e94560',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                  }}
                />
              )}
              {hasDiscount && (
                <Chip
                  label={`-${Math.round(((originalPrice - minPrice) / originalPrice) * 100)}%`}
                  size="small"
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                  }}
                />
              )}
            </Box>
          </Box>
          <CardContent sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            p: 2,
            height: CARD_MIN_HEIGHT - CARD_IMAGE_HEIGHT,
          }}>
            {product.brand?.name && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
                noWrap
              >
                {product.brand.name}
              </Typography>
            )}
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                minHeight: '2.6em',
                fontSize: '0.9rem',
                mb: 0.5,
              }}
            >
              {product.name}
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
                <Typography variant="subtitle1" color="primary" fontWeight={700} sx={{ fontSize: '1rem' }}>
                  From ₵{minPrice.toFixed(2)}
                </Typography>
                {hasDiscount && (
                  <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ₵{originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Shop
        </Typography>
        <Box sx={{ width: { xs: '100%', md: 300 } }}>
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v) }} />
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.map((cat: any) => (
                <MenuItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Brand"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value)
                setPage(1)
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Brands</MenuItem>
              {brands?.map((brand: any) => (
                <MenuItem key={brand.id} value={brand.slug}>
                  {brand.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Sort By"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outlined" fullWidth sx={{ height: '40px' }}>
                Clear Filters
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {total > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {((page - 1) * perPage) + 1} - {Math.min(page * perPage, total)} of {total} products
        </Typography>
      )}

      {error ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading products
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(error as any)?.response?.data?.error || 'Please try again later.'}
          </Typography>
          <Button onClick={() => window.location.reload()} variant="contained" color="primary">
            Retry
          </Button>
        </Paper>
      ) : isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No products found matching your criteria.
          </Typography>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="contained" color="primary" sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <AnimatePresence>
          <Grid container spacing={3}>
            {gridItems.map((p: any) => (
              <Grid item xs={6} sm={4} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>
      )}

      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  )
}
