import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material'
import { Delete, ShoppingCart } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import useCart from '../store/cart'

export default function Wishlist() {
  const { user } = useAuth()
  const cart = useCart()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['wishlist'],
    async () => {
      const res = await api.get('/wishlist')
      return res.data.items || []
    },
    { enabled: !!user }
  )

  const removeMutation = useMutation(
    (productId: string) => api.delete(`/wishlist/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist'])
        toast.success('Removed from wishlist')
      },
    }
  )

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Please log in to view your wishlist
        </Typography>
        <Button component={Link} to="/login" variant="contained" color="primary" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Your wishlist is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start adding products you love!
        </Typography>
        <Button component={Link} to="/shop" variant="contained" color="primary" size="large">
          Browse Products
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        My Wishlist
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {data.map((item: any) => {
          const product = item.product
          const minPrice =
            product.variants && product.variants.length > 0
              ? Math.min(...product.variants.map((v: any) => (v.price - (v.discount || 0)) / 100))
              : 0

          return (
            <Grid item xs={6} sm={4} md={3} key={item.id}>
              <Card
                sx={{
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
                <Box sx={{ position: 'relative' }}>
                  <Link to={`/product/${product.slug}`} style={{ display: 'block' }}>
                    <CardMedia
                      component="img"
                      image={product.images?.[0]?.url || 'https://placehold.co/400x300'}
                      alt={product.name}
                      sx={{ height: 192, cursor: 'pointer' }}
                    />
                  </Link>
                  {product.isNew && (
                    <Chip
                      label="New"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" component={Link} to={`/product/${product.slug}`} fontWeight={500} noWrap sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {product.brand?.name}
                  </Typography>
                  {minPrice > 0 && (
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      From ₵{minPrice.toFixed(2)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCart />}
                    fullWidth
                    onClick={() => {
                      const variantId = product.variants?.[0]?.id
                      if (variantId) {
                        cart.add({ variantId, quantity: 1 })
                        toast.success('Added to cart')
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => removeMutation.mutate(product.id)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
