import React from 'react'
import { Box, Typography, Paper, Tabs, Tab, Container } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

const adminRoutes = [
  { path: '/admin/analytics', label: 'Analytics' },
  { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/products', label: 'Products' },
  { path: '/admin/categories', label: 'Categories' },
  { path: '/admin/brands', label: 'Brands' },
  { path: '/admin/coupons', label: 'Coupons' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/guarantee-claims', label: 'Guarantee Claims' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const currentTab = adminRoutes.findIndex((route) => location.pathname.startsWith(route.path))

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Admin
          </Typography>
        </Box>
        <Tabs value={currentTab >= 0 ? currentTab : false} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          {adminRoutes.map((route) => (
            <Tab key={route.path} label={route.label} component={Link} to={route.path} />
          ))}
        </Tabs>
        <Box>{children}</Box>
      </Paper>
    </Container>
  )
}
