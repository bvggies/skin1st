import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Pagination,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Grid,
  InputAdornment,
  Tooltip,
  Skeleton,
  alpha,
  Divider,
} from '@mui/material'
import {
  Search,
  MoreVert,
  Person,
  Email,
  Phone,
  CalendarToday,
  Block,
  CheckCircle,
  AdminPanelSettings,
  Edit,
  Visibility,
  ShoppingBag,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

export default function Users() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const pageSize = 15
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['admin:users', page, search],
    async () => {
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        if (search) params.set('q', search)
        const res = await api.get(`/admin/users?${params.toString()}`)
        return res.data
      } catch (err: any) {
        console.error('Failed to fetch users:', err)
        throw err
      }
    },
    {
      keepPreviousData: true,
      retry: 2,
      refetchOnWindowFocus: false,
    }
  )

  const toggleStatusMutation = useMutation(
    async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      const res = await api.put(`/admin/users/${userId}`, { enabled })
      return res.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin:users'] })
        toast.success('User status updated')
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update user status')
      },
    }
  )

  const updateRoleMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.put(`/admin/users/${userId}`, { role })
      return res.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin:users'] })
        toast.success('User role updated')
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update user role')
      },
    }
  )

  const users = data?.users || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleViewUser = () => {
    setViewDialogOpen(true)
    handleMenuClose()
  }

  const handleToggleStatus = () => {
    if (selectedUser) {
      toggleStatusMutation.mutate({
        userId: selectedUser.id,
        enabled: !selectedUser.enabled,
      })
    }
    handleMenuClose()
  }

  const handleMakeAdmin = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: 'ADMIN',
      })
    }
    handleMenuClose()
  }

  const handleRemoveAdmin = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: 'CUSTOMER',
      })
    }
    handleMenuClose()
  }

  const handleViewOrders = () => {
    if (selectedUser) {
      // Navigate to orders page with user filter
      navigate(`/admin/orders?userId=${selectedUser.id}`)
    }
    handleMenuClose()
  }

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : 'default'
  }

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'success' : 'error'
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (error) {
    return (
      <AdminLayout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            Failed to load users
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {(error as any)?.response?.data?.error || 'Please check your connection and try again'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Customer Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} registered customers
            </Typography>
          </Box>
          <TextField
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            size="small"
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Users Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Person sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No customers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search ? 'Try a different search term' : 'Customers will appear here when they register'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor: user.role === 'ADMIN' ? 'error.main' : 'primary.main',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getInitials(user.name, user.email)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {user.name || 'No name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{user.email}</Typography>
                          </Stack>
                          {user.phone && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2">{user.phone}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'ADMIN' ? <AdminPanelSettings /> : <Person />}
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                          variant={user.role === 'ADMIN' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.enabled ? <CheckCircle /> : <Block />}
                          label={user.enabled ? 'Active' : 'Disabled'}
                          color={getStatusColor(user.enabled)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Paper>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 180 },
          }}
        >
          <MenuItem onClick={handleViewUser}>
            <Visibility sx={{ mr: 1.5, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleViewOrders}>
            <ShoppingBag sx={{ mr: 1.5, fontSize: 20 }} />
            View Orders
          </MenuItem>
          <Divider />
          {selectedUser?.role === 'ADMIN' ? (
            <MenuItem onClick={handleRemoveAdmin}>
              <Person sx={{ mr: 1.5, fontSize: 20 }} />
              Remove Admin
            </MenuItem>
          ) : (
            <MenuItem onClick={handleMakeAdmin}>
              <AdminPanelSettings sx={{ mr: 1.5, fontSize: 20 }} />
              Make Admin
            </MenuItem>
          )}
          <MenuItem
            onClick={handleToggleStatus}
            sx={{ color: selectedUser?.enabled ? 'error.main' : 'success.main' }}
          >
            {selectedUser?.enabled ? (
              <>
                <Block sx={{ mr: 1.5, fontSize: 20 }} />
                Disable Account
              </>
            ) : (
              <>
                <CheckCircle sx={{ mr: 1.5, fontSize: 20 }} />
                Enable Account
              </>
            )}
          </MenuItem>
        </Menu>

        {/* View User Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                {selectedUser && getInitials(selectedUser.name, selectedUser.email)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser?.name || 'Customer Details'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.email}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Role</Typography>
                <Typography variant="body1">{selectedUser?.role}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body1">{selectedUser?.enabled ? 'Active' : 'Disabled'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedUser?.phone || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Joined</Typography>
                <Typography variant="body1">
                  {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">User ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {selectedUser?.id}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AdminLayout>
  )
}
