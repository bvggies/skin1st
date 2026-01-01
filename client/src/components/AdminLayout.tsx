import React, { useState } from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  alpha,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  Inventory,
  Category,
  LocalOffer,
  People,
  BarChart,
  Settings,
  Logout,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Storefront,
  Receipt,
  MonetizationOn,
  Notifications,
  Search,
  Home,
  VerifiedUser,
} from '@mui/icons-material'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const drawerWidth = 280

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: MenuItem[]
  badge?: number
}

const menuItems: MenuItem[] = [
  { id: 'analytics', label: 'Dashboard', icon: <Dashboard />, path: '/admin/analytics' },
  { id: 'orders', label: 'Orders', icon: <Receipt />, path: '/admin/orders', badge: 5 },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: <Inventory />,
    children: [
      { id: 'products', label: 'Products', icon: <Storefront />, path: '/admin/products' },
      { id: 'categories', label: 'Categories', icon: <Category />, path: '/admin/categories' },
      { id: 'brands', label: 'Brands', icon: <LocalOffer />, path: '/admin/brands' },
    ],
  },
  { id: 'users', label: 'Customers', icon: <People />, path: '/admin/users' },
  { id: 'coupons', label: 'Coupons & Discounts', icon: <MonetizationOn />, path: '/admin/coupons' },
  { id: 'guarantee', label: 'Guarantee Claims', icon: <VerifiedUser />, path: '/admin/guarantee-claims' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['catalog'])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter((id) => id !== menuId))
    } else {
      setExpandedMenus([...expandedMenus, menuId])
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box
          component="img"
          src="/assets/skin1st.png"
          alt="Skin1st"
          sx={{ height: 40, width: 'auto' }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white">
            Skin1st
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List component="nav" sx={{ px: 1.5 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.children ? (
                <>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleMenuClick(item.id)}
                      sx={{
                        borderRadius: 2,
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.08)',
                          color: 'white',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {expandedMenus.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expandedMenus.includes(item.id)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItem key={child.id} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => {
                              navigate(child.path!)
                              if (isMobile) setMobileOpen(false)
                            }}
                            sx={{
                              pl: 4,
                              borderRadius: 2,
                              color: isActive(child.path!) ? 'white' : 'rgba(255,255,255,0.6)',
                              bgcolor: isActive(child.path!) ? 'rgba(233,69,96,0.2)' : 'transparent',
                              borderLeft: isActive(child.path!) ? '3px solid #e94560' : '3px solid transparent',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.08)',
                                color: 'white',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={child.label} 
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path!)
                      if (isMobile) setMobileOpen(false)
                    }}
                    sx={{
                      borderRadius: 2,
                      color: isActive(item.path!) ? 'white' : 'rgba(255,255,255,0.7)',
                      bgcolor: isActive(item.path!) ? 'rgba(233,69,96,0.2)' : 'transparent',
                      borderLeft: isActive(item.path!) ? '3px solid #e94560' : '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: 'white',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {item.badge && (
                      <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* User Section */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#e94560',
              fontSize: '1rem',
            }}
          >
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} color="white" noWrap>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              bgcolor: '#1a1a2e',
              borderRight: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              bgcolor: '#1a1a2e',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            bgcolor: 'white',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {menuItems.find((item) => item.path && isActive(item.path))?.label ||
                menuItems
                  .flatMap((item) => item.children || [])
                  .find((item) => item.path && isActive(item.path!))?.label ||
                'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="View Store">
              <IconButton component={Link} to="/" target="_blank">
                <Home />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
