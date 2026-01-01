import React from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Box,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
} from '@mui/material'
import Newsletter from './Newsletter'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Newsletter />
        </Box>

        <Grid container spacing={4} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'inline-block',
                mb: 2,
                textDecoration: 'none',
              }}
            >
              <Box
                component="img"
                src="/skin1st.png"
                alt="Skin1st Beauty Therapy"
                sx={{
                  height: { xs: 40, md: 50 },
                  width: 'auto',
                  maxWidth: { xs: 150, md: 200 },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Premium beauty and skin therapy products. Quality you can trust.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <MuiLink component={Link} to="/" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Home
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/shop" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Shop
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/about" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  About Us
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/faq" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  FAQ
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/contact" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Contact
                </MuiLink>
              </li>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              My Account
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <MuiLink component={Link} to="/profile" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Profile
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/orders" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  My Orders
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/wishlist" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Wishlist
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/orders/track" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Track Order
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/guarantee/claim" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Money-Back Guarantee
                </MuiLink>
              </li>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Customer Service
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <MuiLink
                  href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}`}
                  color="text.secondary"
                  underline="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Contact WhatsApp
                </MuiLink>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Delivery: 1-3 days
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Payment: Cash on Delivery
                </Typography>
              </li>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <MuiLink component={Link} to="/terms" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Terms & Conditions
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/privacy" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Privacy Policy
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/guarantee/claim" color="text.secondary" underline="hover" sx={{ display: 'block', mb: 1 }}>
                  Money-Back Guarantee
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/login" color="primary" underline="hover" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                  Admin Login
                </MuiLink>
              </li>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Skin1st Beauty Therapy. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
