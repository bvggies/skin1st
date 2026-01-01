import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useScrollTrigger,
  Slide,
} from '@mui/material'
import {
  ShoppingCart,
  Menu as MenuIcon,
  Close,
  Home,
  Store,
  Info,
  HelpOutline,
  Phone,
  Favorite,
  ShoppingBag,
  Person,
  AdminPanelSettings,
  Logout,
  Login as LoginIcon,
  PersonAdd,
  WhatsApp,
} from '@mui/icons-material'
import useCart from '../store/cart'
import { SearchAutocomplete } from './SearchBar'

interface HideOnScrollProps {
  children: React.ReactElement
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger()
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

export default function Header() {
  const cart = useCart((state) => state.items)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
    navigate('/')
  }

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Shop', path: '/shop', icon: <Store /> },
    { label: 'About', path: '/about', icon: <Info /> },
    { label: 'FAQ', path: '/faq', icon: <HelpOutline /> },
    { label: 'Contact', path: '/contact', icon: <Phone /> },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const drawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
      }}>
        <Box component={Link} to="/" onClick={handleDrawerToggle}>
          <Box
            component="img"
            src="/skin1st.png"
            alt="Skin1st"
            sx={{ height: 40, width: 'auto' }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      
      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              selected={isActive(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#25D366' }}>
              <WhatsApp />
            </ListItemIcon>
            <ListItemText primary="WhatsApp" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        {user ? (
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/orders"
              startIcon={<ShoppingBag />}
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleDrawerToggle}
            >
              My Orders
            </Button>
            <Button
              component={Link}
              to="/wishlist"
              startIcon={<Favorite />}
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleDrawerToggle}
            >
              Wishlist
            </Button>
            {user.role === 'ADMIN' && (
              <Button
                component={Link}
                to="/admin/orders"
                startIcon={<AdminPanelSettings />}
                fullWidth
                variant="contained"
                size="small"
                onClick={handleDrawerToggle}
              >
                Admin Panel
              </Button>
            )}
            <Button
              onClick={() => { handleLogout(); handleDrawerToggle(); }}
              startIcon={<Logout />}
              fullWidth
              color="error"
              size="small"
            >
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={handleDrawerToggle}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              fullWidth
              startIcon={<PersonAdd />}
              onClick={handleDrawerToggle}
            >
              Sign Up
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  )

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ py: 1, minHeight: { xs: 64, md: 72 } }}>
              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1, color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Logo */}
              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  mr: { xs: 'auto', md: 4 },
                }}
              >
                <Box
                  component="img"
                  src="/skin1st.png"
                  alt="Skin1st Beauty Therapy"
                  sx={{
                    height: { xs: 36, md: 44 },
                    width: 'auto',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                />
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  {/* Search */}
                  <Box sx={{ width: 280, mr: 2 }}>
                    <SearchAutocomplete />
                  </Box>

                  {/* Nav Links */}
                  <Stack direction="row" spacing={0.5}>
                    {navItems.slice(1).map((item) => (
                      <Button
                        key={item.path}
                        component={Link}
                        to={item.path}
                        sx={{
                          color: isActive(item.path) ? 'primary.main' : 'text.primary',
                          fontWeight: isActive(item.path) ? 600 : 500,
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: isActive(item.path) ? '60%' : 0,
                            height: 2,
                            bgcolor: 'secondary.main',
                            borderRadius: 1,
                            transition: 'width 0.2s ease',
                          },
                          '&:hover::after': {
                            width: '60%',
                          },
                          '&:hover': {
                            bgcolor: 'grey.50',
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                    <Button
                      href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<WhatsApp />}
                      sx={{
                        color: '#25D366',
                        fontWeight: 500,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'rgba(37, 211, 102, 0.1)',
                        },
                      }}
                    >
                      WhatsApp
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Right Actions */}
              <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} alignItems="center">
                {/* Wishlist - desktop only */}
                {!isMobile && user && (
                  <IconButton
                    component={Link}
                    to="/wishlist"
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { color: 'secondary.main' },
                    }}
                  >
                    <Favorite />
                  </IconButton>
                )}

                {/* Cart */}
                <IconButton
                  component={Link}
                  to="/cart"
                  sx={{ 
                    color: 'text.primary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <Badge 
                    badgeContent={cart.length} 
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      },
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* Desktop User Menu */}
                {!isMobile && (
                  <>
                    {user ? (
                      <>
                        <IconButton
                          onClick={handleProfileMenuOpen}
                          sx={{ 
                            ml: 1,
                            border: '2px solid',
                            borderColor: 'grey.200',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {(user.name || user.email)?.[0]?.toUpperCase()}
                          </Avatar>
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleProfileMenuClose}
                          onClick={handleProfileMenuClose}
                          PaperProps={{
                            sx: {
                              mt: 1.5,
                              minWidth: 200,
                              borderRadius: 2,
                              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            },
                          }}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <MenuItem component={Link} to="/profile">
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                            My Profile
                          </MenuItem>
                          <MenuItem component={Link} to="/orders">
                            <ListItemIcon><ShoppingBag fontSize="small" /></ListItemIcon>
                            My Orders
                          </MenuItem>
                          <MenuItem component={Link} to="/wishlist">
                            <ListItemIcon><Favorite fontSize="small" /></ListItemIcon>
                            Wishlist
                          </MenuItem>
                          {user.role === 'ADMIN' && (
                            <MenuItem component={Link} to="/admin/orders">
                              <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>
                              Admin Panel
                            </MenuItem>
                          )}
                          <Divider />
                          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                            Logout
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                        <Button
                          component={Link}
                          to="/login"
                          variant="text"
                          sx={{ 
                            color: 'text.primary',
                            fontWeight: 500,
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          component={Link}
                          to="/register"
                          variant="contained"
                          sx={{
                            bgcolor: 'primary.main',
                            px: 3,
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          }}
                        >
                          Sign Up
                        </Button>
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
