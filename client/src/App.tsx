import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'
import OrderTrack from './pages/OrderTrack'
import Dashboard from './pages/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminProducts from './pages/admin/Products'
import AdminUsers from './pages/admin/Users'
import AdminGuaranteeClaims from './pages/admin/GuaranteeClaims'
import AdminAnalytics from './pages/admin/Analytics'
import AdminCoupons from './pages/admin/Coupons'
import AdminCategories from './pages/admin/Categories'
import AdminBrands from './pages/admin/Brands'
import GuaranteeClaim from './pages/GuaranteeClaim'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import About from './pages/About'
import Wishlist from './pages/Wishlist'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import WhatsAppFloat from './components/WhatsAppFloat'

import { Container, Box } from '@mui/material'

// Layout for public pages (with Header and Footer)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#fafafa',
      }}
    >
      <Header />
      <Box 
        component="main"
        sx={{ 
          flex: 1, 
          width: '100%',
        }}
      >
        {children}
      </Box>
      <Footer />
      <WhatsAppFloat />
    </Box>
  )
}

// Public routes component
function PublicRoutes() {
  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}><Shop /></Container>} />
        <Route path="/product/:slug" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Product /></Container>} />
        <Route path="/cart" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Cart /></Container>} />
        <Route path="/checkout" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Checkout /></Container>} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Profile /></Container>} />
        <Route path="/orders" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><MyOrders /></Container>} />
        <Route path="/orders/track" element={<OrderTrack />} />
        <Route path="/wishlist" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Wishlist /></Container>} />
        <Route path="/contact" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Contact /></Container>} />
        <Route path="/faq" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><FAQ /></Container>} />
        <Route path="/about" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><About /></Container>} />
        <Route path="/terms" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Terms /></Container>} />
        <Route path="/privacy" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><Privacy /></Container>} />
        <Route path="/guarantee/claim" element={<Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}><GuaranteeClaim /></Container>} />
      </Routes>
    </PublicLayout>
  )
}

// Admin routes (no Header/Footer - AdminLayout handles its own layout)
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminAnalytics />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/brands" element={<AdminBrands />} />
      <Route path="/admin/coupons" element={<AdminCoupons />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/guarantee-claims" element={<AdminGuaranteeClaims />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Render admin routes without the public layout
  if (isAdminRoute) {
    return <AdminRoutes />
  }

  // Render public routes with Header/Footer
  return <PublicRoutes />
}
