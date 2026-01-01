import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material'
import {
  Person,
  ShoppingBag,
  Favorite,
  LocationOn,
  Settings,
  Receipt,
  TrackChanges,
  Edit,
  Delete,
  Add,
  Home,
  Work,
  Star,
  Notifications,
  Security,
  LocalShipping,
  CheckCircle,
  Schedule,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'

// Ghana Regions
const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern',
  'Upper East', 'Upper West', 'Volta', 'Bono', 'Bono East', 'Ahafo',
  'Western North', 'Oti', 'North East', 'Savannah',
]

const statusColors: Record<string, 'warning' | 'info' | 'secondary' | 'success' | 'primary' | 'default' | 'error'> = {
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'info',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  PAID: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Schemas
const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
})

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const AddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  alternativePhone: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  landmark: z.string().optional(),
  fullAddress: z.string().min(5, 'Full address is required'),
  isDefault: z.boolean().optional(),
})

type ProfileForm = z.infer<typeof ProfileSchema>
type PasswordForm = z.infer<typeof PasswordSchema>
type AddressForm = z.infer<typeof AddressSchema>

const menuItems = [
  { id: 'overview', label: 'Overview', icon: <Person /> },
  { id: 'orders', label: 'My Orders', icon: <ShoppingBag /> },
  { id: 'addresses', label: 'Saved Addresses', icon: <LocationOn /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Favorite /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const queryClient = useQueryClient()

  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)

  const setActiveTab = (tab: string) => {
    setSearchParams(new URLSearchParams({ tab }))
    setMobileMenuOpen(false)
  }

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['my-orders'],
    async () => {
      const res = await api.get('/orders/my')
      return res.data.orders || []
    },
    { enabled: !!user }
  )

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading } = useQuery(
    ['my-addresses'],
    async () => {
      const res = await api.get('/user/addresses')
      return res.data.addresses || []
    },
    { enabled: !!user }
  )

  // Fetch wishlist
  const { data: wishlistData, isLoading: wishlistLoading } = useQuery(
    ['wishlist'],
    async () => {
      const res = await api.get('/wishlist')
      return res.data.items || []
    },
    { enabled: !!user }
  )

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(PasswordSchema),
  })

  // Address form
  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      isDefault: false,
    },
  })

  // Profile update mutation
  const updateProfileMutation = useMutation(
    (data: ProfileForm) => api.put('/user/profile', data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully')
        queryClient.invalidateQueries(['user'])
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update profile')
      },
    }
  )

  // Password update mutation
  const updatePasswordMutation = useMutation(
    (data: { currentPassword: string; newPassword: string }) => api.put('/user/password', data),
    {
      onSuccess: () => {
        toast.success('Password updated successfully')
        passwordForm.reset()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update password')
      },
    }
  )

  // Address mutations
  const saveAddressMutation = useMutation(
    (data: AddressForm) => editingAddress 
      ? api.put(`/user/addresses/${editingAddress.id}`, data)
      : api.post('/user/addresses', data),
    {
      onSuccess: () => {
        toast.success(editingAddress ? 'Address updated' : 'Address added')
        queryClient.invalidateQueries(['my-addresses'])
        setAddressDialogOpen(false)
        setEditingAddress(null)
        addressForm.reset()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to save address')
      },
    }
  )

  const deleteAddressMutation = useMutation(
    (id: string) => api.delete(`/user/addresses/${id}`),
    {
      onSuccess: () => {
        toast.success('Address deleted')
        queryClient.invalidateQueries(['my-addresses'])
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to delete address')
      },
    }
  )

  // Notification preferences mutation
  const updateNotificationsMutation = useMutation(
    (data: { emailNotifications?: boolean; smsNotifications?: boolean }) => 
      api.put('/user/profile', data),
    {
      onSuccess: () => {
        toast.success('Preferences updated')
        queryClient.invalidateQueries(['user'])
      },
      onError: () => {
        toast.error('Failed to update preferences')
      },
    }
  )

  // Remove from wishlist
  const removeFromWishlistMutation = useMutation(
    (productId: string) => api.delete(`/wishlist/${productId}`),
    {
      onSuccess: () => {
        toast.success('Removed from wishlist')
        queryClient.invalidateQueries(['wishlist'])
      },
      onError: () => {
        toast.error('Failed to remove from wishlist')
      },
    }
  )

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Person sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Please log in to view your dashboard
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Container>
    )
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    addressForm.reset({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      alternativePhone: address.alternativePhone || '',
      region: address.region,
      city: address.city,
      area: address.area || '',
      landmark: address.landmark || '',
      fullAddress: address.fullAddress,
      isDefault: address.isDefault,
    })
    setAddressDialogOpen(true)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    addressForm.reset({
      label: '',
      recipientName: user?.name || '',
      phone: user?.phone || '',
      alternativePhone: '',
      region: '',
      city: '',
      area: '',
      landmark: '',
      fullAddress: '',
      isDefault: false,
    })
    setAddressDialogOpen(true)
  }

  const sidebarContent = (
    <List sx={{ py: 1 }}>
      {menuItems.map((item) => (
        <ListItem
          key={item.id}
          button
          onClick={() => setActiveTab(item.id)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            mx: 1,
            bgcolor: activeTab === item.id ? 'primary.lighter' : 'transparent',
            color: activeTab === item.id ? 'primary.main' : 'text.secondary',
            '&:hover': {
              bgcolor: activeTab === item.id ? 'primary.lighter' : 'grey.100',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.label} 
            primaryTypographyProps={{ fontWeight: activeTab === item.id ? 600 : 400 }}
          />
        </ListItem>
      ))}
    </List>
  )

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        {isMobile ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%', px: 2 }}>
              <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
              </Typography>
            </Box>
            <Drawer
              anchor="left"
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            >
              <Box sx={{ width: 280, pt: 2 }}>
                <Box sx={{ px: 3, pb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>My Account</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                {sidebarContent}
              </Box>
            </Drawer>
          </>
        ) : (
          <Grid item md={3}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 80 }}>
              <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Avatar sx={{ width: 56, height: 56, mb: 2, bgcolor: 'white', color: 'primary.main' }}>
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>{user.name || 'User'}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{user.email}</Typography>
              </Box>
              {sidebarContent}
            </Paper>
          </Grid>
        )}

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Stack spacing={3}>
              {/* Quick Stats */}
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <ShoppingBag sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>{ordersData?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <LocalShipping sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {ordersData?.filter((o: any) => ['PENDING_CONFIRMATION', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.status)).length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {ordersData?.filter((o: any) => ['DELIVERED', 'COMPLETED'].includes(o.status)).length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Delivered</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                    <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>{wishlistData?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Wishlist</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Recent Orders */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
                  <Button onClick={() => setActiveTab('orders')} size="small">View All</Button>
                </Stack>
                {ordersLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                ) : ordersData?.length === 0 ? (
                  <Alert severity="info">No orders yet. Start shopping!</Alert>
                ) : (
                  <Stack spacing={2}>
                    {ordersData?.slice(0, 3).map((order: any) => (
                      <Card key={order.id} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>{order.code}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip 
                                label={statusLabels[order.status]} 
                                color={statusColors[order.status]} 
                                size="small" 
                              />
                              <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                                ₵{(order.total / 100).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Quick Actions */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>Quick Actions</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    component={RouterLink} 
                    to="/orders/track" 
                    variant="outlined" 
                    startIcon={<TrackChanges />}
                    fullWidth
                  >
                    Track Order
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/shop" 
                    variant="contained" 
                    startIcon={<ShoppingBag />}
                    fullWidth
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('addresses')} 
                    variant="outlined" 
                    startIcon={<LocationOn />}
                    fullWidth
                  >
                    Manage Addresses
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>My Orders</Typography>
              {ordersLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
              ) : ordersData?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ShoppingBag sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>No orders yet</Typography>
                  <Button component={RouterLink} to="/shop" variant="contained">Start Shopping</Button>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {ordersData?.map((order: any) => (
                    <Card key={order.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="h6" fontWeight={600}>{order.code}</Typography>
                              <Chip 
                                label={statusLabels[order.status]} 
                                color={statusColors[order.status]} 
                                size="small" 
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                              {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                <Typography key={idx} variant="body2">
                                  {item.variant?.name || 'Product'} × {item.quantity}
                                </Typography>
                              ))}
                              {order.items?.length > 3 && (
                                <Typography variant="body2" color="text.secondary">
                                  +{order.items.length - 3} more
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="h5" fontWeight={700} color="primary">
                              ₵{(order.total / 100).toFixed(2)}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: { md: 'flex-end' } }}>
                              <Button
                                component={RouterLink}
                                to={`/orders/track?code=${order.code}`}
                                size="small"
                                startIcon={<TrackChanges />}
                              >
                                Track
                              </Button>
                              <Button
                                href={`/api/orders/${order.id}/invoice?code=${order.code}`}
                                target="_blank"
                                size="small"
                                startIcon={<Receipt />}
                              >
                                Invoice
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Saved Addresses</Typography>
                <Button startIcon={<Add />} variant="contained" onClick={handleAddAddress}>
                  Add Address
                </Button>
              </Stack>
              {addressesLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
              ) : addressesData?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <LocationOn sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>No saved addresses</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add addresses for faster checkout
                  </Typography>
                  <Button startIcon={<Add />} variant="contained" onClick={handleAddAddress}>
                    Add Address
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {addressesData?.map((address: any) => (
                    <Grid item xs={12} md={6} key={address.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1} alignItems="center">
                              {address.label?.toLowerCase() === 'home' ? <Home color="primary" /> : 
                               address.label?.toLowerCase() === 'office' ? <Work color="primary" /> : 
                               <LocationOn color="primary" />}
                              <Typography variant="subtitle1" fontWeight={600}>{address.label}</Typography>
                              {address.isDefault && (
                                <Chip label="Default" size="small" color="primary" />
                              )}
                            </Stack>
                            <Stack direction="row">
                              <IconButton size="small" onClick={() => handleEditAddress(address)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => deleteAddressMutation.mutate(address.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" fontWeight={500}>{address.recipientName}</Typography>
                            <Typography variant="body2" color="text.secondary">{address.phone}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {address.fullAddress}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {[address.area, address.city, address.region].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>My Wishlist</Typography>
              {wishlistLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
              ) : wishlistData?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Favorite sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Your wishlist is empty</Typography>
                  <Button component={RouterLink} to="/shop" variant="contained">Browse Products</Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {wishlistData?.map((item: any) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          {item.product?.images?.[0]?.url && (
                            <Box
                              component="img"
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                            />
                          )}
                          <IconButton
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                            onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                          >
                            <Delete color="error" />
                          </IconButton>
                        </Box>
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            component={RouterLink}
                            to={`/product/${item.product?.slug}`}
                            sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                          >
                            {item.product?.name}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
                            {item.product?.variants?.[0]?.price 
                              ? `₵${((item.product.variants[0].price - (item.product.variants[0].discount || 0)) / 100).toFixed(2)}`
                              : 'Price varies'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Stack spacing={3}>
              {/* Profile Settings */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Profile Information
                </Typography>
                <Box 
                  component="form" 
                  onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
                  sx={{ mt: 2, maxWidth: 500 }}
                >
                  <Stack spacing={3}>
                    <TextField
                      {...profileForm.register('name')}
                      label="Full Name"
                      fullWidth
                      error={!!profileForm.formState.errors.name}
                      helperText={profileForm.formState.errors.name?.message}
                    />
                    <TextField
                      label="Email"
                      value={user.email}
                      disabled
                      fullWidth
                      helperText="Email cannot be changed"
                    />
                    <TextField
                      {...profileForm.register('phone')}
                      label="Phone Number"
                      fullWidth
                      error={!!profileForm.formState.errors.phone}
                      helperText={profileForm.formState.errors.phone?.message}
                    />
                    <Button 
                      type="submit" 
                      variant="contained"
                      disabled={updateProfileMutation.isLoading}
                    >
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Stack>
                </Box>
              </Paper>

              {/* Password Settings */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Change Password
                </Typography>
                <Box 
                  component="form" 
                  onSubmit={passwordForm.handleSubmit((data) => 
                    updatePasswordMutation.mutate({
                      currentPassword: data.currentPassword,
                      newPassword: data.newPassword,
                    })
                  )}
                  sx={{ mt: 2, maxWidth: 500 }}
                >
                  <Stack spacing={3}>
                    <TextField
                      {...passwordForm.register('currentPassword')}
                      label="Current Password"
                      type="password"
                      fullWidth
                      error={!!passwordForm.formState.errors.currentPassword}
                      helperText={passwordForm.formState.errors.currentPassword?.message}
                    />
                    <TextField
                      {...passwordForm.register('newPassword')}
                      label="New Password"
                      type="password"
                      fullWidth
                      error={!!passwordForm.formState.errors.newPassword}
                      helperText={passwordForm.formState.errors.newPassword?.message}
                    />
                    <TextField
                      {...passwordForm.register('confirmPassword')}
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      error={!!passwordForm.formState.errors.confirmPassword}
                      helperText={passwordForm.formState.errors.confirmPassword?.message}
                    />
                    <Button 
                      type="submit" 
                      variant="contained"
                      disabled={updatePasswordMutation.isLoading}
                    >
                      {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Stack>
                </Box>
              </Paper>

              {/* Notification Preferences */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Notification Preferences
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        defaultChecked={user.emailNotifications !== false}
                        onChange={(e) => updateNotificationsMutation.mutate({ emailNotifications: e.target.checked })}
                      />
                    }
                    label="Email notifications for order updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        defaultChecked={user.smsNotifications !== false}
                        onChange={(e) => updateNotificationsMutation.mutate({ smsNotifications: e.target.checked })}
                      />
                    }
                    label="SMS notifications for order updates"
                  />
                </Stack>
              </Paper>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <Box 
            component="form" 
            id="address-form"
            onSubmit={addressForm.handleSubmit((data) => saveAddressMutation.mutate(data))}
            sx={{ pt: 1 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('label')}
                  label="Address Label *"
                  placeholder="e.g., Home, Office"
                  fullWidth
                  error={!!addressForm.formState.errors.label}
                  helperText={addressForm.formState.errors.label?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('recipientName')}
                  label="Recipient Name *"
                  fullWidth
                  error={!!addressForm.formState.errors.recipientName}
                  helperText={addressForm.formState.errors.recipientName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('phone')}
                  label="Phone Number *"
                  fullWidth
                  error={!!addressForm.formState.errors.phone}
                  helperText={addressForm.formState.errors.phone?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('alternativePhone')}
                  label="Alternative Phone"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('region')}
                  select
                  label="Region *"
                  fullWidth
                  defaultValue={editingAddress?.region || ''}
                  error={!!addressForm.formState.errors.region}
                  helperText={addressForm.formState.errors.region?.message}
                >
                  <MenuItem value="">Select Region</MenuItem>
                  {GHANA_REGIONS.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('city')}
                  label="City/Town *"
                  fullWidth
                  error={!!addressForm.formState.errors.city}
                  helperText={addressForm.formState.errors.city?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('area')}
                  label="Area/Neighborhood"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...addressForm.register('landmark')}
                  label="Nearby Landmark"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...addressForm.register('fullAddress')}
                  label="Full Address *"
                  placeholder="House number, street name, etc."
                  fullWidth
                  multiline
                  rows={2}
                  error={!!addressForm.formState.errors.fullAddress}
                  helperText={addressForm.formState.errors.fullAddress?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch {...addressForm.register('isDefault')} />}
                  label="Set as default address"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button 
            type="submit"
            form="address-form"
            variant="contained"
            disabled={saveAddressMutation.isLoading}
          >
            {saveAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

