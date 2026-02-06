import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function RelatedProducts({
  productId,
  categorySlug,
}: {
  productId: string
  categorySlug?: string
}) {
  const { data, isLoading } = useQuery(
    ['related', productId, categorySlug],
    async () => {
      const res = await api.get(`/products/related?category=${encodeURIComponent(categorySlug || '')}`)
      return res.data.products
    },
    { enabled: !!categorySlug, staleTime: 2 * 60 * 1000 } // 2 min — API is cached
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
        Related products
      </Typography>
      <Grid container spacing={2}>
        {data.map((p: any) => (
          <Grid item xs={6} sm={3} key={p.id}>
            <Card
              component={Link}
              to={`/product/${p.slug}`}
              sx={{
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardMedia
                component="img"
                height="120"
                image={p.images?.[0]?.url || 'https://placehold.co/200x150'}
                alt={p.name}
              />
              <CardContent>
                <Typography variant="body2" component="div" fontWeight={500} noWrap>
                  {p.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
