import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
      const res = await api.get(`/products?${qs.join('&')}`)
      return res.data
    },
    {
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
  }

  const hasActiveFilters = selectedCategory || selectedBrand || sort || search

  const ProductCard = ({ product }: { product: any }) => {
    const minPrice =
      product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
        : 0

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
      >
        <Card
          component={Link}
          to={`/product/${product.slug}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="160"
              image={product.images?.[0]?.url || 'https://placehold.co/400x300'}
              alt={product.name}
            />
            {product.isNew && (
              <Chip
                label="New"
                color="primary"
                size="small"
                sx={{ position: 'absolute', top: 8, left: 8 }}
              />
            )}
            {product.isBestSeller && (
              <Chip
                label="Best Seller"
                color="warning"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
          </Box>
          <CardContent>
            <Typography variant="h6" component="div" noWrap gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {product.brand?.name}
            </Typography>
            {minPrice > 0 && (
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                From ₵{minPrice.toFixed(2)}
              </Typography>
            )}
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
