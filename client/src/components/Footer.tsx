import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Box,
  Grid,
  Typography,
  Link as MuiLink,
  Stack,
  IconButton,
} from '@mui/material'
import {
  Facebook,
  Instagram,
  Twitter,
  WhatsApp,
  LocationOn,
  Email,
  Phone,
  ArrowForward,
} from '@mui/icons-material'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Products', path: '/shop' },
      { label: 'New Arrivals', path: '/shop?sort=new' },
      { label: 'Best Sellers', path: '/shop?sort=bestseller' },
      { label: 'Special Offers', path: '/shop?sale=true' },
      { label: 'Adult Products', path: '/adult-shop' },
    ],
    account: [
      { label: 'My Profile', path: '/profile' },
      { label: 'My Orders', path: '/orders' },
      { label: 'Wishlist', path: '/wishlist' },
      { label: 'Track Order', path: '/orders/track' },
    ],
    support: [
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Money-Back Guarantee', path: '/guarantee/claim' },
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  }

  const socialLinks = [
    { icon: <Facebook />, href: '#', label: 'Facebook' },
    { icon: <Instagram />, href: '#', label: 'Instagram' },
    { icon: <Twitter />, href: '#', label: 'Twitter' },
    { icon: <WhatsApp />, href: `https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || ''}`, label: 'WhatsApp' },
  ]

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a2e',
        color: 'white',
        mt: 'auto',
      }}
    >
      {/* Main Footer */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        <Grid container spacing={5}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box component={Link} to="/" sx={{ display: 'inline-block', mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
                whileTap={{ scale: 0.95 }}
                style={{ display: 'inline-block' }}
              >
                <Box
                  component="img"
                  src="/assets/skin1stwhite.png"
                  alt="Skin1st Beauty Therapy"
                  sx={{
                    height: 50,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(1)',
                    transition: 'filter 4s ease-in-out',
                    animation: 'pulseFooter 4s ease-in-out infinite',
                    '@keyframes pulseFooter': {
                      '0%, 100%': {
                        filter: 'brightness(1)',
                      },
                      '50%': {
                        filter: 'brightness(1.15)',
                      },
                    },
                  }}
                />
              </motion.div>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 300 }}>
              Premium beauty and skin therapy products. Quality you can trust, 
              delivered to your doorstep with love and care.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: '#e94560',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Shop Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
              Shop
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.shop.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#e94560',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Account Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
              Account
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.account.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#e94560',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
              Support
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.support.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#e94560',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
              Contact
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <WhatsApp sx={{ color: '#25D366', fontSize: 20, mt: 0.3 }} />
                <MuiLink
                  href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: '#25D366' },
                  }}
                >
                  WhatsApp Chat
                </MuiLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Email sx={{ color: '#e94560', fontSize: 20, mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  support@skin1st.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ color: '#e94560', fontSize: 20, mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Accra, Ghana
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              © {currentYear} Skin1st Beauty Therapy. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <MuiLink
                component={Link}
                to="/terms"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'white' },
                }}
              >
                Terms
              </MuiLink>
              <MuiLink
                component={Link}
                to="/privacy"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'white' },
                }}
              >
                Privacy
              </MuiLink>
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#e94560' },
                }}
              >
                Admin
              </MuiLink>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
