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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Add, Delete, Close } from '@mui/icons-material'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

export default function Coupons() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin:coupons'], async () => {
    const res = await api.get('/admin/coupons')
    return res.data.coupons || []
  })

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/coupons/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin:coupons'])
        toast.success('Coupon deleted')
      },
      onError: () => {
        toast.error('Failed to delete coupon')
      },
    }
  )

  const coupons = data || []

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Coupons
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
          >
            New Coupon
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
                  <TableCell>Code</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Max Uses</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No coupons found. Create your first coupon!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon: any) => (
                    <TableRow key={coupon.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {coupon.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {coupon.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%`
                          : `₵${(coupon.value / 100).toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        {coupon.expiry ? new Date(coupon.expiry).toLocaleDateString() : 'No expiry'}
                      </TableCell>
                      <TableCell>{coupon.maxUses || 'Unlimited'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => deleteMutation.mutate(coupon.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {showCreateModal && (
          <CouponForm
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries(['admin:coupons'])
              setShowCreateModal(false)
            }}
          />
        )}
      </Stack>
    </AdminLayout>
  )
}

function CouponForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    expiry: '',
    maxUses: '',
  })

  const createMutation = useMutation(
    (data: any) => api.post('/admin/coupons', data),
    {
      onSuccess: () => {
        toast.success('Coupon created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to create coupon')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: formData.type === 'percentage' ? parseInt(formData.value) : parseInt(formData.value) * 100,
      expiry: formData.expiry || null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
    })
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create Coupon</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="coupon-form-type-label">Type *</InputLabel>
              <Select
                id="coupon-form-type"
                labelId="coupon-form-type-label"
                value={formData.type}
                label="Type *"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed Amount</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={`Value * ${formData.type === 'percentage' ? '(%)' : '(₵)'}`}
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              fullWidth
              inputProps={{
                min: 0,
                max: formData.type === 'percentage' ? 100 : undefined,
              }}
            />
            <TextField
              label="Expiry Date (optional)"
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Max Uses (optional)"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              fullWidth
              inputProps={{ min: 1 }}
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
          disabled={createMutation.isLoading}
        >
          {createMutation.isLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
