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
  ShoppingCart,
  TrackChanges,
  Payment,
  Store,
  AddShoppingCart,
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
  // Fetch site settings
  const { data: siteSettings } = useQuery(
    ['site-settings'],
    async () => {
      const res = await api.get('/site-settings')
      return res.data
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  )

  const heroTitle = siteSettings?.heroTitle || 'Discover Your Natural Beauty'
  const heroSubtitle = siteSettings?.heroSubtitle || 'Premium beauty and skin therapy products. Quality you can trust, delivered to your doorstep with cash on delivery.'
  const heroImageUrl = siteSettings?.heroImageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
  const specialOfferTitle = siteSettings?.specialOfferTitle || 'Special Offer - 20% Off'
  const specialOfferDescription = siteSettings?.specialOfferDescription || 'Use code FIRST20 on your first order. Limited time only!'
  const { data: categoriesData } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', 'featured'],
    async () => {
      const res = await api.get('/products?perPage=8&adult=false')
      return res.data.products || []
    }
  )

  // Use API data if available, otherwise use sample data
  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : sampleCategories
  const products = productsData && productsData.length > 0 ? productsData : sampleProducts

  // Fixed dimensions for consistent card sizes
  const CARD_IMAGE_HEIGHT = 220
  const CARD_MIN_HEIGHT = 380

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
          height: CARD_MIN_HEIGHT,
          minHeight: CARD_MIN_HEIGHT,
          maxHeight: CARD_MIN_HEIGHT,
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
        {/* Image Container - Fixed Height */}
        <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'grey.50', height: CARD_IMAGE_HEIGHT, minHeight: CARD_IMAGE_HEIGHT }}>
          <Link to={`/product/${product.slug}`}>
            <CardMedia
              component="img"
              image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'}
              alt={product.name}
              className="product-image"
              sx={{
                width: '100%',
                height: CARD_IMAGE_HEIGHT,
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

        {/* Content - Fixed Height */}
        <CardContent sx={{ 
          p: 2, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: CARD_MIN_HEIGHT - CARD_IMAGE_HEIGHT,
          minHeight: CARD_MIN_HEIGHT - CARD_IMAGE_HEIGHT,
        }}>
          {product.brand?.name && (
            <Typography
              variant="caption"
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 500, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                mb: 0.5,
                fontSize: '0.7rem',
              }}
              noWrap
            >
              {product.brand.name}
            </Typography>
          )}
          
          <Typography
            component={Link}
            to={`/product/${product.slug}`}
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'text.primary',
              textDecoration: 'none',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
              minHeight: '2.6em', // Ensures 2 lines height
              mb: 0.5,
              '&:hover': { color: 'secondary.main' },
            }}
          >
            {product.name}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
            <Rating value={4.5} precision={0.5} size="small" readOnly sx={{ color: '#fbbf24', fontSize: '0.9rem' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>(24)</Typography>
          </Stack>

          <Box sx={{ mt: 'auto' }}>
            <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ fontSize: '1rem' }}>
                ₵{(minPrice / 100).toFixed(2)}
              </Typography>
              {hasDiscount && (
                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
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
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.25rem', md: '3rem', lg: '3.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  {heroTitle.includes('\n') ? (
                    heroTitle.split('\n').map((line, i) => (
                      <Box key={i} component="span" sx={i > 0 ? { color: '#e94560', display: 'block' } : {}}>
                        {line}
                      </Box>
                    ))
                  ) : (
                    heroTitle
                  )}
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
                  {heroSubtitle}
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
                  src={heroImageUrl}
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
                {specialOfferTitle}
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, fontWeight: 400 }}>
                {specialOfferDescription}
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

      {/* How It Works - Purchase Process */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(233, 69, 96, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Chip
              label="Simple & Easy"
              sx={{
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 600,
                px: 2,
                py: 0.5,
                mb: 2,
                fontSize: '0.875rem',
              }}
            />
            <Typography 
              variant="h2" 
              fontWeight={800} 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              How It Works
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              Get your favorite beauty products delivered to your doorstep in just a few simple steps
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ position: 'relative' }}>
            {/* Connecting Line (Desktop Only) */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'block' },
                position: 'absolute',
                top: '120px',
                left: '10%',
                right: '10%',
                height: 3,
                background: 'linear-gradient(90deg, #6366f1 0%, #10b981 25%, #f59e0b 50%, #ec4899 75%, #e94560 100%)',
                borderRadius: 2,
                opacity: 0.2,
                zIndex: 0,
              }}
            />

            {[
              {
                step: 1,
                icon: <Store sx={{ fontSize: 36 }} />,
                title: 'Browse & Select',
                description: 'Explore our wide range of premium beauty products and add your favorites to cart',
                color: '#6366f1',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                link: '/shop',
              },
              {
                step: 2,
                icon: <AddShoppingCart sx={{ fontSize: 36 }} />,
                title: 'Add to Cart',
                description: 'Review your selected items and proceed to checkout when ready',
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                link: '/cart',
              },
              {
                step: 3,
                icon: <Payment sx={{ fontSize: 36 }} />,
                title: 'Place Order',
                description: 'Fill in your delivery details and confirm your order. No payment required upfront!',
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                link: '/checkout',
              },
              {
                step: 4,
                icon: <TrackChanges sx={{ fontSize: 36 }} />,
                title: 'Track Order',
                description: 'Use your unique tracking code to monitor your order status in real-time',
                color: '#ec4899',
                gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                link: '/orders/track',
              },
              {
                step: 5,
                icon: <LocalShipping sx={{ fontSize: 36 }} />,
                title: 'Receive & Pay',
                description: 'Get your products delivered to your door and pay securely with cash on delivery',
                color: '#e94560',
                gradient: 'linear-gradient(135deg, #e94560 0%, #c73e54 100%)',
                link: null,
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.step}>
                <Card
                  component={item.link ? Link : Box}
                  to={item.link || undefined}
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    borderRadius: 4,
                    border: 'none',
                    bgcolor: 'white',
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: item.link ? 'pointer' : 'default',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(30px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 24px 48px ${item.color}25`,
                      '& .step-number': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: item.gradient,
                        color: 'white',
                      },
                      '& .step-icon': {
                        transform: 'scale(1.1) rotate(-5deg)',
                        background: item.gradient,
                        color: 'white',
                      },
                    },
                    textDecoration: 'none',
                  }}
                >
                  {/* Step Number Badge */}
                  <Box
                    className="step-number"
                    sx={{
                      position: 'absolute',
                      top: -24,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: item.gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      border: '4px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 2,
                    }}
                  >
                    {item.step}
                  </Box>

                  {/* Icon Container */}
                  <Box
                    className="step-icon"
                    sx={{
                      width: { xs: 72, md: 88 },
                      height: { xs: 72, md: 88 },
                      borderRadius: 3,
                      background: `${item.color}10`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      mt: { xs: 3, md: 4 },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 3,
                        background: `${item.color}08`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      mb: 1.5,
                      color: 'text.primary',
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: '0.875rem', md: '0.95rem' },
                      px: { xs: 1, md: 0 },
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Arrow Connector (Desktop Only) */}
                  {item.step < 5 && (
                    <Box
                      sx={{
                        display: { xs: 'none', lg: 'flex' },
                        position: 'absolute',
                        right: { lg: -32, xl: -40 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 2,
                          background: item.gradient,
                          borderRadius: 1,
                          mr: 1,
                        }}
                      />
                      <ArrowForward 
                        sx={{ 
                          fontSize: 28, 
                          color: item.color,
                          opacity: 0.6,
                        }} 
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* CTA Section */}
          <Box sx={{ textAlign: 'center', mt: { xs: 8, md: 10 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid',
                borderColor: 'grey.200',
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2rem' } }}>
                Ready to Get Started?
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  maxWidth: 600, 
                  mx: 'auto',
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.7,
                }}
              >
                Start shopping now and enjoy free delivery on all orders. Pay securely when you receive your products!
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                sx={{ maxWidth: 500, mx: 'auto' }}
              >
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  size="large"
                  startIcon={<Store />}
                  sx={{
                    bgcolor: 'primary.main',
                    px: 5,
                    py: 1.75,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(233, 69, 96, 0.3)',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(233, 69, 96, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Browse Products
                </Button>
                <Button
                  component={Link}
                  to="/orders/track"
                  variant="outlined"
                  size="large"
                  startIcon={<TrackChanges />}
                  sx={{
                    borderColor: 'primary.main',
                    borderWidth: 2,
                    color: 'primary.main',
                    px: 5,
                    py: 1.75,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: '1rem',
                    textTransform: 'none',
                    bgcolor: 'white',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      borderWidth: 2,
                      bgcolor: 'primary.lighter',
                      color: 'primary.dark',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Track Order
                </Button>
              </Stack>
            </Paper>
          </Box>
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
