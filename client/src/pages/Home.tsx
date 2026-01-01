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
  Chip,
  Stack,
  IconButton,
  Paper,
  Rating,
  Skeleton,
} from '@mui/material'
import {
  ShoppingBag,
  LocalShipping,
  Security,
  Favorite,
  FavoriteBorder,
  Star,
  ArrowForward,
  Verified,
  SupportAgent,
  Autorenew,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import api from '../api/axios'
import Newsletter from '../components/Newsletter'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function Home() {
  const { data: categories } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: featured, isLoading: featuredLoading } = useQuery(
    ['products', 'featured'],
    async () => {
      const res = await api.get('/products?perPage=8')
      return res.data.products || []
    }
  )

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery(
    ['products', 'bestsellers'],
    async () => {
      const res = await api.get('/products?perPage=12')
      const products = res.data.products || []
      return products.filter((p: any) => p.isBestSeller).slice(0, 4)
    }
  )

  const { data: newProducts, isLoading: newProductsLoading } = useQuery(
    ['products', 'new'],
    async () => {
      const res = await api.get('/products?perPage=12')
      const products = res.data.products || []
      return products.filter((p: any) => p.isNew).slice(0, 4)
    }
  )

  // Product Card Component
  const ProductCard = ({ product, index = 0 }: { product: any; index?: number }) => {
    const minPrice = product.variants?.length > 0
      ? Math.min(...product.variants.map((v: any) => v.price - (v.discount || 0)))
      : 0
    const originalPrice = product.variants?.length > 0
      ? Math.min(...product.variants.map((v: any) => v.price))
      : 0
    const hasDiscount = minPrice < originalPrice

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.100',
            boxShadow: 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: 'transparent',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              transform: 'translateY(-8px)',
              '& .product-image': {
                transform: 'scale(1.08)',
              },
              '& .quick-actions': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {/* Image Container */}
          <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'grey.50' }}>
            <Link to={`/product/${product.slug}`}>
              <CardMedia
                component="img"
                height="260"
                image={product.images?.[0]?.url || 'https://placehold.co/400x300?text=Product'}
                alt={product.name}
                className="product-image"
                sx={{
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </Link>

            {/* Badges */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {product.isNew && (
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    bgcolor: '#1a1a2e',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 24,
                    letterSpacing: '0.05em',
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
                    height: 24,
                    letterSpacing: '0.05em',
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
                    height: 24,
                  }}
                />
              )}
            </Box>

            {/* Quick Actions */}
            <Box
              className="quick-actions"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                opacity: 0,
                transform: 'translateY(-10px)',
                transition: 'all 0.3s ease',
              }}
            >
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: 'secondary.main', color: 'white' },
                }}
              >
                <FavoriteBorder fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {product.brand?.name && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}
              >
                {product.brand.name}
              </Typography>
            )}
            
            <Typography
              component={Link}
              to={`/product/${product.slug}`}
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.primary',
                textDecoration: 'none',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                mb: 1,
                '&:hover': { color: 'secondary.main' },
              }}
            >
              {product.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
              <Rating value={4.5} precision={0.5} size="small" readOnly sx={{ color: '#fbbf24' }} />
              <Typography variant="caption" color="text.secondary">(24)</Typography>
            </Stack>

            <Box sx={{ mt: 'auto' }}>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ₵{(minPrice / 100).toFixed(2)}
                </Typography>
                {hasDiscount && (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ₵{(originalPrice / 100).toFixed(2)}
                  </Typography>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Skeleton Card
  const SkeletonProductCard = () => (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={260} />
      <CardContent>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="30%" height={28} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )

  // Category Card
  const CategoryCard = ({ category, index }: { category: any; index: number }) => (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        component={Link}
        to={`/shop?category=${category.slug}`}
        sx={{
          textAlign: 'center',
          p: 3,
          textDecoration: 'none',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.100',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 12px 40px rgba(26,26,46,0.15)',
            transform: 'translateY(-6px)',
            '& .category-icon': {
              bgcolor: 'primary.main',
              color: 'white',
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <Box
          className="category-icon"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <ShoppingBag sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {category.name}
        </Typography>
      </Card>
    </motion.div>
  )

  // Feature Card
  const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.100',
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'transparent',
            boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            color: 'white',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </motion.div>
  )

  const features = [
    { icon: <LocalShipping sx={{ fontSize: 28 }} />, title: 'Free Delivery', description: 'Fast 1-3 days delivery on all orders' },
    { icon: <Security sx={{ fontSize: 28 }} />, title: 'Secure Payment', description: 'Safe & secure checkout with COD' },
    { icon: <Autorenew sx={{ fontSize: 28 }} />, title: 'Money Back', description: '100% money-back guarantee' },
    { icon: <SupportAgent sx={{ fontSize: 28 }} />, title: '24/7 Support', description: 'WhatsApp support anytime' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(233,69,96,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,52,96,0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Chip
                  label="✨ Premium Quality Products"
                  sx={{
                    bgcolor: 'rgba(233,69,96,0.2)',
                    color: '#ff6b8a',
                    fontWeight: 600,
                    mb: 3,
                    border: '1px solid rgba(233,69,96,0.3)',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  Discover Your
                  <Box component="span" sx={{ color: '#e94560', display: 'block' }}>
                    Natural Beauty
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: 480,
                  }}
                >
                  Premium beauty and skin therapy products. Quality you can trust, 
                  delivered to your doorstep with cash on delivery.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={Link}
                    to="/shop"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: '#e94560',
                      color: 'white',
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#c73e54',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(233,69,96,0.4)',
                      },
                    }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.4)',
                      color: 'white',
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </Stack>

                {/* Trust badges */}
                <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                  {[
                    { value: '10K+', label: 'Happy Customers' },
                    { value: '500+', label: 'Products' },
                    { value: '4.9', label: 'Rating' },
                  ].map((stat, i) => (
                    <Box key={i}>
                      <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>{stat.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '10%',
                      left: '10%',
                      right: '-5%',
                      bottom: '-5%',
                      borderRadius: 4,
                      bgcolor: 'rgba(233,69,96,0.2)',
                      zIndex: 0,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
                    alt="Beauty Products"
                    sx={{
                      width: '100%',
                      height: { xs: 320, md: 450 },
                      objectFit: 'cover',
                      borderRadius: 4,
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={6} md={3} key={index}>
              <FeatureCard {...feature} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="overline"
                sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.1em' }}
              >
                Categories
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
                Shop by Category
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {categories.slice(0, 6).map((category: any, index: number) => (
                <Grid item xs={6} sm={4} md={2} key={category.id}>
                  <CategoryCard category={category} index={index} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 5 }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.1em' }}
                >
                  Our Collection
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
                  Featured Products
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/shop"
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={3}>
              {featuredLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                      <SkeletonProductCard />
                    </Grid>
                  ))
                : featured.slice(0, 8).map((product: any, index: number) => (
                    <Grid item xs={6} sm={4} md={3} key={product.id}>
                      <ProductCard product={product} index={index} />
                    </Grid>
                  ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 4, display: { xs: 'block', sm: 'none' } }}>
              <Button component={Link} to="/shop" variant="contained" endIcon={<ArrowForward />}>
                View All Products
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* Promo Banner */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #e94560 0%, #ff6b8a 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '50%',
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} sx={{ textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Special Offer - 20% Off
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400 }}>
                  Use code FIRST20 on your first order. Limited time only!
                </Typography>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: '#e94560',
                    px: 5,
                    py: 1.75,
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  Shop Now
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Best Sellers */}
      {bestSellers && bestSellers.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 10 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 5 }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.1em' }}
                >
                  Top Rated
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
                  Best Sellers
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/shop"
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={3}>
              {bestSellersLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Grid item xs={6} md={3} key={i}>
                      <SkeletonProductCard />
                    </Grid>
                  ))
                : bestSellers.map((product: any, index: number) => (
                    <Grid item xs={6} md={3} key={product.id}>
                      <ProductCard product={product} index={index} />
                    </Grid>
                  ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* New Arrivals */}
      {newProducts && newProducts.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 5 }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.1em' }}
                >
                  Just In
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
                  New Arrivals
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/shop"
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={3}>
              {newProductsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Grid item xs={6} md={3} key={i}>
                      <SkeletonProductCard />
                    </Grid>
                  ))
                : newProducts.map((product: any, index: number) => (
                    <Grid item xs={6} md={3} key={product.id}>
                      <ProductCard product={product} index={index} />
                    </Grid>
                  ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Newsletter */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Newsletter />
        </Container>
      </Box>
    </Box>
  )
}
