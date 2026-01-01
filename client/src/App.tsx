import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'
import OrderTrack from './pages/OrderTrack'
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

import { Container, Box } from '@mui/material'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      <Header />
      <Box sx={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Container maxWidth="lg" sx={{ py: 3 }}><Shop /></Container>} />
          <Route path="/product/:slug" element={<Container maxWidth="lg" sx={{ py: 3 }}><Product /></Container>} />
          <Route path="/cart" element={<Container maxWidth="lg" sx={{ py: 3 }}><Cart /></Container>} />
          <Route path="/checkout" element={<Container maxWidth="lg" sx={{ py: 3 }}><Checkout /></Container>} />
          <Route path="/login" element={<Container maxWidth="lg" sx={{ py: 3 }}><Login /></Container>} />
          <Route path="/register" element={<Container maxWidth="lg" sx={{ py: 3 }}><Register /></Container>} />
          <Route path="/profile" element={<Container maxWidth="lg" sx={{ py: 3 }}><Profile /></Container>} />
          <Route path="/orders" element={<Container maxWidth="lg" sx={{ py: 3 }}><MyOrders /></Container>} />
          <Route path="/orders/track" element={<Container maxWidth="lg" sx={{ py: 3 }}><OrderTrack /></Container>} />
          <Route path="/wishlist" element={<Container maxWidth="lg" sx={{ py: 3 }}><Wishlist /></Container>} />
          <Route path="/contact" element={<Container maxWidth="lg" sx={{ py: 3 }}><Contact /></Container>} />
          <Route path="/faq" element={<Container maxWidth="lg" sx={{ py: 3 }}><FAQ /></Container>} />
          <Route path="/about" element={<Container maxWidth="lg" sx={{ py: 3 }}><About /></Container>} />
          <Route path="/terms" element={<Container maxWidth="lg" sx={{ py: 3 }}><Terms /></Container>} />
          <Route path="/privacy" element={<Container maxWidth="lg" sx={{ py: 3 }}><Privacy /></Container>} />
          <Route path="/guarantee/claim" element={<Container maxWidth="lg" sx={{ py: 3 }}><GuaranteeClaim /></Container>} />

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
      </Box>
      <Footer />
    </Box>
  )
}
