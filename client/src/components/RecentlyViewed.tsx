import React, { useEffect, useState } from 'react'
import { Grid, Card, CardMedia, CardContent, Typography, Box } from '@mui/material'
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
      return {
        products: allProducts.filter((p: any) => productIds.includes(p.id)),
      }
    },
    { enabled: productIds.length > 0 }
  )

  if (!productIds.length || !data?.products?.length) return null

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
        Recently Viewed
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {data.products.map((p: any) => {
          const minPrice =
            p.variants && p.variants.length > 0
              ? Math.min(...p.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
              : 0
          return (
            <Grid item xs={6} sm={3} key={p.id}>
              <Card
                component={Link}
                to={`/product/${p.slug}`}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={p.images?.[0]?.url || 'https://placehold.co/400x300'}
                  alt={p.name}
                />
                <CardContent>
                  <Typography variant="subtitle1" component="div" noWrap fontWeight={500}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {p.brand?.name}
                  </Typography>
                  {minPrice > 0 && (
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      From ₵{minPrice.toFixed(2)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
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

    ids = ids.filter((id) => id !== productId)
    ids.unshift(productId)
    ids = ids.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [productId])
}
