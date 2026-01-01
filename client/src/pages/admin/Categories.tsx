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

export default function Categories() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:categories'], async () => {
    const res = await api.get('/admin/categories')
    return res.data.categories || []
  })

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/categories/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        toast.success('Category deleted')
      },
      onError: () => {
        toast.error('Failed to delete category')
      },
    }
  )

  const categories = data || []

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Categories
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
          >
            New Category
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
                {categories.map((cat: any) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {cat.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cat.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>{cat.products?.length || 0}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => setEditingCategory(cat)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this category?')) {
                              deleteMutation.mutate(cat.id)
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

        {(showCreateModal || editingCategory) && (
          <CategoryForm
            category={editingCategory}
            onClose={() => {
              setShowCreateModal(false)
              setEditingCategory(null)
            }}
            onSuccess={() => {
              queryClient.invalidateQueries(['categories'])
              setShowCreateModal(false)
              setEditingCategory(null)
            }}
          />
        )}
      </Stack>
    </AdminLayout>
  )
}

function CategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category?: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
  })

  const createMutation = useMutation(
    (data: any) => api.post('/admin/categories', data),
    {
      onSuccess: () => {
        toast.success('Category created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to create category')
      },
    }
  )

  const updateMutation = useMutation(
    (data: any) => api.put(`/admin/categories/${category?.id}`, data),
    {
      onSuccess: () => {
        toast.success('Category updated successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update category')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{category ? 'Edit Category' : 'Create Category'}</Typography>
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
                  slug: category ? formData.slug : name.toLowerCase().replace(/\s+/g, '-'),
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
          {createMutation.isLoading || updateMutation.isLoading
            ? 'Saving...'
            : category
              ? 'Update'
              : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
