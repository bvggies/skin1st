import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Chip,
  Stack,
} from '@mui/material'
import { motion } from 'framer-motion'
import api from '../api/axios'
import SkeletonCard from '../components/SkeletonCard'

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useQuery(
    ['products', 'featured'],
    async () => {
      const res = await api.get('/products?perPage=8')
      return res.data.products
    }
  )

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery(
    ['products', 'bestsellers'],
    async () => {
      const res = await api.get('/products?perPage=4')
      const products = res.data.products || []
      return products.filter((p: any) => p.isBestSeller).slice(0, 4)
    }
  )

  const { data: newProducts, isLoading: newProductsLoading } = useQuery(
    ['products', 'new'],
    async () => {
      const res = await api.get('/products?perPage=4')
      const products = res.data.products || []
      return products.filter((p: any) => p.isNew).slice(0, 4)
    }
  )

  const ProductCard = ({ product }: { product: any }) => {
    const minPrice = product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v: any) => v.price - (v.discount || 0)))
      : 0

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
              height="200"
              image={product.images?.[0]?.url || 'https://placehold.co/400x300'}
              alt={product.name}
            />
            {product.isBestSeller && (
              <Chip
                label="Best Seller"
                color="warning"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
            {product.isNew && (
              <Chip
                label="New"
                color="primary"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" gutterBottom noWrap>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {product.brand?.name}
            </Typography>
            {minPrice > 0 && (
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                From ₵{(minPrice / 100).toFixed(2)}
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Box>
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)',
          p: 4,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Skin1st Beauty Therapy
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Premium beauty and skin therapy products — COD, 1–3 day delivery, money-back guarantee.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/shop"
              variant="contained"
              size="large"
              color="primary"
            >
              Shop Now
            </Button>
            <Button
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I want to order')}`}
              variant="contained"
              size="large"
              color="success"
            >
              Contact WhatsApp
            </Button>
          </Stack>
        </Container>
      </Paper>

      {bestSellers && bestSellers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Best Sellers
            </Typography>
            <Button component={Link} to="/shop" color="primary">
              View all →
            </Button>
          </Box>
          {bestSellersLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {bestSellers.map((p: any) => (
                <Grid item xs={6} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {newProducts && newProducts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight={600}>
              New Arrivals
            </Typography>
            <Button component={Link} to="/shop" color="primary">
              View all →
            </Button>
          </Box>
          {newProductsLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {newProducts.map((p: any) => (
                <Grid item xs={6} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
