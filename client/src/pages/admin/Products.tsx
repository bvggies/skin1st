import React, { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Box,
  Typography,
  TextField,
  Button,
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
  InputAdornment,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Divider,
  alpha,
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  ContentCopy,
  Inventory,
  FilterList,
  Download,
  Upload,
} from '@mui/icons-material'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import ProductForm from '../../components/admin/ProductForm'
import toast from 'react-hot-toast'

export default function Products() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const pageSize = 15
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin:products', page, search, categoryFilter, brandFilter],
    async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('perPage', String(pageSize))
      if (search) params.set('search', search)
      if (categoryFilter) params.set('category', categoryFilter)
      if (brandFilter) params.set('brand', brandFilter)
      const res = await api.get(`/products?${params.toString()}`)
      return res.data
    },
    { keepPreviousData: true }
  )

  const { data: categories } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: brands } = useQuery(['brands'], async () => {
    const res = await api.get('/brands')
    return res.data.brands || []
  })

  const deleteMutation = useMutation(
    async (id: string) => {
      await api.delete(`/admin/products/${id}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin:products'])
        toast.success('Product deleted successfully')
        setDeleteDialogOpen(false)
      },
      onError: () => {
        toast.error('Failed to delete product')
      },
    }
  )

  const products = data?.products || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedProduct(product)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    setEditingProduct(selectedProduct)
    handleMenuClose()
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleDuplicate = () => {
    setEditingProduct({
      ...selectedProduct,
      id: undefined,
      name: `${selectedProduct.name} (Copy)`,
      slug: `${selectedProduct.slug}-copy`,
    })
    handleMenuClose()
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id)
    }
  }

  const getStockStatus = (variants: any[]) => {
    if (!variants || variants.length === 0) return { label: 'No Variants', color: 'default' as const }
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    if (totalStock === 0) return { label: 'Out of Stock', color: 'error' as const }
    if (totalStock < 10) return { label: 'Low Stock', color: 'warning' as const }
    return { label: 'In Stock', color: 'success' as const }
  }

  const getPriceRange = (variants: any[]) => {
    if (!variants || variants.length === 0) return '-'
    const prices = variants.map((v) => (v.price - (v.discount || 0)) / 100)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `₵${min.toFixed(2)}`
    return `₵${min.toFixed(2)} - ₵${max.toFixed(2)}`
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setBrandFilter('')
    setPage(1)
  }

  const hasFilters = search || categoryFilter || brandFilter

  return (
    <AdminLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} products in catalog
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateModal(true)}
              sx={{ bgcolor: '#e94560', '&:hover': { bgcolor: '#c73e54' } }}
            >
              Add Product
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="admin-products-category-label">Category</InputLabel>
                <Select
                  id="admin-products-category"
                  labelId="admin-products-category-label"
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories?.map((cat: any) => (
                    <MenuItem key={cat.id} value={cat.slug}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="admin-products-brand-label">Brand</InputLabel>
                <Select
                  id="admin-products-brand"
                  labelId="admin-products-brand-label"
                  value={brandFilter}
                  label="Brand"
                  onChange={(e) => {
                    setBrandFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  {brands?.map((brand: any) => (
                    <MenuItem key={brand.id} value={brand.slug}>{brand.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              {hasFilters && (
                <Button onClick={clearFilters} size="small" fullWidth>
                  Clear Filters
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category / Brand</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Badges</TableCell>
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Inventory sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No products found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {hasFilters ? 'Try different filters' : 'Start by adding your first product'}
                      </Typography>
                      {!hasFilters && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => setShowCreateModal(true)}
                        >
                          Add Product
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p: any) => {
                    const stockStatus = getStockStatus(p.variants)
                    return (
                      <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              variant="rounded"
                              src={p.images?.[0]?.url}
                              sx={{ width: 56, height: 56 }}
                            >
                              <Inventory />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {p.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                /{p.slug}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {p.category?.name || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.brand?.name || '-'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {getPriceRange(p.variants)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.variants?.length || 0} variant(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stockStatus.label}
                            color={stockStatus.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {p.isNew && (
                              <Chip label="New" color="primary" size="small" />
                            )}
                            {p.isBestSeller && (
                              <Chip label="Best" color="warning" size="small" />
                            )}
                            {p.moneyBackGuarantee && (
                              <Chip label="MBG" color="success" size="small" variant="outlined" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                component="a"
                                href={`/product/${p.slug}`}
                                target="_blank"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => setEditingProduct(p)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, p)}>
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
          PaperProps={{ sx: { minWidth: 160 } }}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1.5, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>
            <ContentCopy sx={{ mr: 1.5, fontSize: 20 }} />
            Duplicate
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1.5, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Product Form Modal */}
        {(showCreateModal || editingProduct) && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowCreateModal(false)
              setEditingProduct(null)
            }}
            onSuccess={() => {
              queryClient.invalidateQueries(['admin:products'])
              setShowCreateModal(false)
              setEditingProduct(null)
            }}
          />
        )}
      </Stack>
    </AdminLayout>
  )
}
