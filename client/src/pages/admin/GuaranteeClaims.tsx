import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'

const statusColors: Record<
  string,
  'warning' | 'info' | 'success' | 'error' | 'default'
> = {
  SUBMITTED: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  REFUNDED: 'default',
}

export default function GuaranteeClaims() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const pageSize = 20
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin:guarantee-claims', page, status],
    async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (status) params.set('status', status)
      const res = await api.get(`/admin/guarantee-claims?${params.toString()}`)
      return res.data
    }
  )

  const updateMutation = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/guarantee-claims/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin:guarantee-claims'])
        toast.success('Claim status updated')
      },
      onError: () => {
        toast.error('Failed to update claim status')
      },
    }
  )

  const claims = data?.claims || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Guarantee Claims
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="SUBMITTED">Submitted</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
            </Select>
          </FormControl>
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
                    <TableCell>Order Code</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim: any) => (
                    <TableRow key={claim.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {claim.order?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {claim.order?.user?.name || claim.order?.user?.email || 'Guest'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                          {claim.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={claim.status}
                          color={statusColors[claim.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {claim.status === 'SUBMITTED' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'UNDER_REVIEW' })}
                              >
                                Review
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'REJECTED' })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {claim.status === 'UNDER_REVIEW' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'APPROVED' })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => updateMutation.mutate({ id: claim.id, status: 'REJECTED' })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {claim.status === 'APPROVED' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => updateMutation.mutate({ id: claim.id, status: 'REFUNDED' })}
                            >
                              Mark Refunded
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {total > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} claims
                </Typography>
                <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Stack>
    </AdminLayout>
  )
}
