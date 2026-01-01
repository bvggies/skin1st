import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  Paper,
  Container,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Schema = z.object({
  orderCode: z.string().min(1, 'Order code is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
})

type Form = z.infer<typeof Schema>

export default function GuaranteeClaim() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(Schema),
  })
  const navigate = useNavigate()

  async function onSubmit(data: Form) {
    try {
      const res = await api.post('/guarantee.claim', {
        orderCode: data.orderCode.toUpperCase(),
        reason: data.reason,
      })
      toast.success('Guarantee claim submitted successfully! We will review it shortly.')
      navigate(`/orders/track?code=${data.orderCode.toUpperCase()}`)
    } catch (e: any) {
      console.error(e)
      const errorMsg = e.response?.data?.error || 'Failed to submit guarantee claim'
      toast.error(errorMsg)
    }
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Money-Back Guarantee Claim
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          About Our Guarantee
        </Typography>
        <Typography variant="body2">
          We offer a 30-day money-back guarantee on all products. If you're not satisfied with your purchase, you
          can file a claim for a full refund. Claims are typically reviewed within 2-3 business days.
        </Typography>
      </Alert>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <TextField
              type="text"
              {...register('orderCode')}
              label="Order Code *"
              placeholder="ORD-XXXXXXX"
              fullWidth
              error={!!errors.orderCode}
              helperText={errors.orderCode?.message || 'Enter the order code from your order confirmation'}
            />

            <TextField
              rows={5}
              {...register('reason')}
              label="Reason for Claim *"
              multiline
              placeholder="Please describe why you're requesting a refund..."
              fullWidth
              error={!!errors.reason}
              helperText={errors.reason?.message || "Please provide detailed information about why you're requesting a refund"}
            />

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Note:</strong> Your order must be in "Delivered", "Paid", or "Completed" status to file a
                claim. Refunds will be processed within 5-7 business days after approval.
              </Typography>
            </Alert>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Guarantee Claim'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
