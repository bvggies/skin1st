import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material'
import { Add, Edit, Delete, Close } from '@mui/icons-material'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

export default function Brands() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin:brands'],
    async () => {
      try {
        const res = await api.get('/admin/brands')
        return res.data.brands || []
      } catch (err: any) {
        console.error('Failed to fetch brands:', err)
        throw err
      }
    },
    {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/brands/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin:brands'] })
        queryClient.invalidateQueries({ queryKey: ['brands'] })
        toast.success('Brand deleted')
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to delete brand')
      },
    }
  )

  const brands = data || []

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Brands
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
          >
            New Brand
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand: any) => (
                  <TableRow key={brand.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {brand.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {brand.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>{brand.products?.length || 0}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => setEditingBrand(brand)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this brand?')) {
                              deleteMutation.mutate(brand.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <BrandForm
          open={showCreateModal || !!editingBrand}
          brand={editingBrand}
          onClose={() => {
            setShowCreateModal(false)
            setEditingBrand(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin:brands'] })
            queryClient.invalidateQueries({ queryKey: ['brands'] })
            setShowCreateModal(false)
            setEditingBrand(null)
          }}
        />
      </Stack>
    </AdminLayout>
  )
}

function BrandForm({ 
  open, 
  brand, 
  onClose, 
  onSuccess 
}: { 
  open: boolean
  brand?: any
  onClose: () => void
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    slug: brand?.slug || '',
  })

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: brand?.name || '',
        slug: brand?.slug || '',
      })
    }
  }, [open, brand])

  const createMutation = useMutation(
    async (data: any) => {
      const res = await api.post('/admin/brands', data)
      return res.data
    },
    {
      onSuccess: () => {
        toast.success('Brand created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        const errorMsg = e.response?.data?.error || e.message || 'Failed to create brand'
        toast.error(errorMsg)
        console.error('Create brand error:', e)
      },
    }
  )

  const updateMutation = useMutation(
    async (data: any) => {
      const res = await api.put(`/admin/brands/${brand?.id}`, data)
      return res.data
    },
    {
      onSuccess: () => {
        toast.success('Brand updated successfully')
        onSuccess()
      },
      onError: (e: any) => {
        const errorMsg = e.response?.data?.error || e.message || 'Failed to update brand'
        toast.error(errorMsg)
        console.error('Update brand error:', e)
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (brand) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{brand ? 'Edit Brand' : 'Create Brand'}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Name *"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData({
                  name,
                  slug: brand ? formData.slug : name.toLowerCase().replace(/\s+/g, '-'),
                })
              }}
              required
              fullWidth
            />
            <TextField
              label="Slug *"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
              }
              required
              fullWidth
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={createMutation.isLoading || updateMutation.isLoading}
        >
          {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : brand ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
