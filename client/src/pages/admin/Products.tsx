import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  CircularProgress,
  Link,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import ProductForm from '../../components/admin/ProductForm'

export default function Products() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const pageSize = 20
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin:products', page, search],
    async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('perPage', String(pageSize))
      if (search) params.set('search', search)
      const res = await api.get(`/products?${params.toString()}`)
      return res.data
    }
  )

  const products = data?.products || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Products
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              size="small"
              sx={{ width: 250 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setShowCreateModal(true)}
            >
              New Product
            </Button>
          </Stack>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Variants</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.slug}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{p.brand?.name || '-'}</TableCell>
                      <TableCell>{p.category?.name || '-'}</TableCell>
                      <TableCell>{p.variants?.length || 0} variants</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {p.isNew && <Chip label="New" color="primary" size="small" />}
                          {p.isBestSeller && <Chip label="Best" color="warning" size="small" />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                          >
                            View
                          </Link>
                          <Button size="small" onClick={() => setEditingProduct(p)}>
                            Edit
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} products
              </Typography>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
            </Box>
          </>
        )}

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
