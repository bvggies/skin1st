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
      <Container maxWidth="lg" sx={{ flex: 1, py: 3, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/track" element={<OrderTrack />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guarantee/claim" element={<GuaranteeClaim />} />

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
      </Container>
      <Footer />
    </Box>
  )
}
