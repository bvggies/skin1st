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
  Avatar,
} from '@mui/material'
import {
  LocalShipping,
  Security,
  FavoriteBorder,
  ArrowForward,
  SupportAgent,
  Autorenew,
  Spa,
  Face,
  Opacity,
  WaterDrop,
  Sanitizer,
  AutoAwesome,
} from '@mui/icons-material'
import api from '../api/axios'
import Newsletter from '../components/Newsletter'

// Sample categories with icons for display
const sampleCategories = [
  { id: '1', name: 'Face Care', slug: 'face-care', icon: Face, color: '#e94560' },
  { id: '2', name: 'Body Oils', slug: 'body-oils', icon: Opacity, color: '#10b981' },
  { id: '3', name: 'Serums', slug: 'serums', icon: WaterDrop, color: '#6366f1' },
  { id: '4', name: 'Moisturizers', slug: 'moisturizers', icon: Spa, color: '#f59e0b' },
  { id: '5', name: 'Cleansers', slug: 'cleansers', icon: Sanitizer, color: '#ec4899' },
  { id: '6', name: 'Treatments', slug: 'treatments', icon: AutoAwesome, color: '#8b5cf6' },
]

// Sample products for display when API is empty
const sampleProducts = [
  {
    id: '1',
    name: 'Vitamin C Brightening Serum',
    slug: 'vitamin-c-serum',
    brand: { name: 'Skin1st' },
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80' }],
    variants: [{ price: 4500, discount: 500 }],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Hydrating Rose Face Oil',
    slug: 'rose-face-oil',
    brand: { name: 'Pure Beauty' },
    images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80' }],
    variants: [{ price: 3500, discount: 0 }],
    isNew: true,
  },
  {
    id: '3',
    name: 'Anti-Aging Night Cream',
    slug: 'anti-aging-cream',
    brand: { name: 'Skin1st' },
    images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400&q=80' }],
    variants: [{ price: 5500, discount: 1000 }],
    isBestSeller: true,
  },
  {
    id: '4',
    name: 'Gentle Foaming Cleanser',
    slug: 'foaming-cleanser',
    brand: { name: 'Natural Glow' },
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80' }],
    variants: [{ price: 2800, discount: 0 }],
  },
  {
    id: '5',
    name: 'Hyaluronic Acid Moisturizer',
    slug: 'hyaluronic-moisturizer',
    brand: { name: 'Skin1st' },
    images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&q=80' }],
    variants: [{ price: 4200, discount: 700 }],
    isNew: true,
  },
  {
    id: '6',
    name: 'Tea Tree Spot Treatment',
    slug: 'tea-tree-treatment',
    brand: { name: 'Pure Beauty' },
    images: [{ url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80' }],
    variants: [{ price: 1800, discount: 0 }],
    isBestSeller: true,
  },
  {
    id: '7',
    name: 'Collagen Boost Eye Cream',
    slug: 'collagen-eye-cream',
    brand: { name: 'Skin1st' },
    images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80' }],
    variants: [{ price: 3200, discount: 400 }],
  },
  {
    id: '8',
    name: 'Niacinamide Pore Minimizer',
    slug: 'niacinamide-serum',
    brand: { name: 'Natural Glow' },
    images: [{ url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=80' }],
    variants: [{ price: 3800, discount: 0 }],
    isNew: true,
    isBestSeller: true,
  },
]

export default function Home() {
  const { data: categoriesData } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', 'featured'],
    async () => {
      const res = await api.get('/products?perPage=8')
      return res.data.products || []
    }
  )

  // Use API data if available, otherwise use sample data
  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : sampleCategories
  const products = productsData && productsData.length > 0 ? productsData : sampleProducts

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
          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
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
              height="240"
              image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'}
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
    )
  }

  // Skeleton Card
  const SkeletonProductCard = () => (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={240} />
      <CardContent>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="30%" height={28} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )

  // Category Card with Icon
  const CategoryCard = ({ category, index }: { category: any; index: number }) => {
    const IconComponent = category.icon || Spa
    const iconColor = category.color || '#e94560'
    
    return (
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
          animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`,
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '&:hover': {
            borderColor: iconColor,
            boxShadow: `0 12px 40px ${iconColor}25`,
            transform: 'translateY(-6px)',
            '& .category-icon': {
              bgcolor: iconColor,
              color: 'white',
              transform: 'scale(1.1) rotate(5deg)',
            },
          },
        }}
      >
        <Avatar
          className="category-icon"
          sx={{
            width: 72,
            height: 72,
            bgcolor: `${iconColor}15`,
            color: iconColor,
            mb: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <IconComponent sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          {category.name}
        </Typography>
      </Card>
    )
  }

  // Feature Card
  const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'white',
        height: '100%',
        transition: 'all 0.3s ease',
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
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
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  )

  const features = [
    { icon: <LocalShipping sx={{ fontSize: 26 }} />, title: 'Free Delivery', description: '1-3 days delivery' },
    { icon: <Security sx={{ fontSize: 26 }} />, title: 'Secure Payment', description: 'Cash on delivery' },
    { icon: <Autorenew sx={{ fontSize: 26 }} />, title: 'Money Back', description: '100% guarantee' },
    { icon: <SupportAgent sx={{ fontSize: 26 }} />, title: '24/7 Support', description: 'WhatsApp support' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          pt: { xs: 6, md: 10 },
          pb: { xs: 12, md: 16 },
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

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: 'slideInLeft 0.8s ease-out', '@keyframes slideInLeft': { from: { opacity: 0, transform: 'translateX(-40px)' }, to: { opacity: 1, transform: 'translateX(0)' } } }}>
                {/* Logo in Hero */}
                <Box
                  component="img"
                  src="/skin1st.png"
                  alt="Skin1st"
                  sx={{
                    height: 60,
                    width: 'auto',
                    mb: 3,
                    filter: 'brightness(0) invert(1)',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.25rem', md: '3rem', lg: '3.5rem' },
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
                      py: 1.5,
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
                      py: 1.5,
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
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  animation: 'slideInRight 0.8s ease-out 0.2s both',
                  '@keyframes slideInRight': {
                    from: { opacity: 0, transform: 'translateX(40px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
                  alt="Beauty Products"
                  sx={{
                    width: '100%',
                    height: { xs: 280, md: 400 },
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Overlapping */}
      <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -8 }, position: 'relative', zIndex: 10, mb: 6 }}>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={6} md={3} key={index}>
              <FeatureCard {...feature} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.1em' }}
            >
              Categories
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
              Shop by Category
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 500, mx: 'auto' }}>
              Explore our wide range of premium beauty products
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {categories.slice(0, 6).map((category: any, index: number) => (
              <Grid item xs={6} sm={4} md={2} key={category.id || index}>
                <CategoryCard category={category} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
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
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <SkeletonProductCard />
                  </Grid>
                ))
              : products.slice(0, 8).map((product: any, index: number) => (
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

      {/* Promo Banner */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, #e94560 0%, #ff6b8a 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} sx={{ textAlign: 'center' }}>
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
                  py: 1.5,
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
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Best Sellers */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
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
            {products.filter((p: any) => p.isBestSeller).slice(0, 4).map((product: any, index: number) => (
              <Grid item xs={6} md={3} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Newsletter */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Newsletter />
        </Container>
      </Box>
    </Box>
  )
}
