import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ShoppingCart,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
} from '@mui/icons-material'
import useCart from '../store/cart'
import { SearchAutocomplete } from './SearchBar'

export default function Header() {
  const cart = useCart((state) => state.items)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    // You can implement theme switching here if needed
  }

  return (
    <AppBar position="sticky" color="default" elevation={2} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 4,
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

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 300 }}>
              <SearchAutocomplete />
            </Box>
            <Button component={Link} to="/shop" color="inherit" size="small">
              Shop
            </Button>
            <Button component={Link} to="/about" color="inherit" size="small">
              About
            </Button>
            <Button component={Link} to="/faq" color="inherit" size="small">
              FAQ
            </Button>
            <Button component={Link} to="/contact" color="inherit" size="small">
              Contact
            </Button>
            <Button
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I want to order')}`}
              color="inherit"
              size="small"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </Button>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={toggleDarkMode} size="small" color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>

            {user ? (
              <>
                <Button component={Link} to="/wishlist" color="inherit" size="small">
                  Wishlist
                </Button>
                <Button component={Link} to="/orders" color="inherit" size="small">
                  Orders
                </Button>
                <Button component={Link} to="/profile" color="inherit" size="small">
                  Profile
                </Button>
                {user.role === 'ADMIN' && (
                  <Button component={Link} to="/admin/orders" color="inherit" size="small">
                    Admin
                  </Button>
                )}
                <Typography variant="body2" sx={{ mx: 1 }}>
                  Hi, {user.name || user.email}
                </Typography>
                <Button onClick={logout} color="error" size="small">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit" size="small">
                  Login
                </Button>
                <Button component={Link} to="/register" color="primary" variant="contained" size="small">
                  Sign Up
                </Button>
              </>
            )}

            <IconButton component={Link} to="/cart" color="inherit">
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
