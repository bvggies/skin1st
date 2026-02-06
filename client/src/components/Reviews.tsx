import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Rating,
  Stack,
  Divider,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import api from '../api/axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
})
type ReviewInput = z.infer<typeof ReviewSchema>

export function ReviewsList({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery(
    ['reviews', slug],
    async () => {
      const r = await api.get(`/products/${slug}/reviews`)
      return r.data.reviews
    },
    { staleTime: 2 * 60 * 1000 } // 2 min — API is cached; avoid refetch on remount
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No reviews yet. Be the first to review this product!
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {data.map((rev: any) => (
        <Paper key={rev.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={rev.rating} readOnly size="small" />
            <Typography variant="subtitle2" fontWeight={500}>
              {rev.title || `Rating ${rev.rating}/5`}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            by {rev.user?.name || 'Anonymous'} • {new Date(rev.createdAt).toLocaleDateString()}
          </Typography>
          {rev.body && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {rev.body}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  )
}

export function ReviewForm({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReviewInput>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: { rating: 5, title: '', body: '' },
  })

  const rating = watch('rating')

  const mutation = useMutation(
    (payload: ReviewInput) => api.post(`/products/${slug}/reviews`, payload),
    {
      onMutate: async (newReview) => {
        await queryClient.cancelQueries(['reviews', slug])
        const previous = queryClient.getQueryData<any[]>(['reviews', slug]) || []
        const optimistic = [
          {
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            user: null,
            ...newReview,
          },
          ...previous,
        ]
        queryClient.setQueryData(['reviews', slug], optimistic)
        return { previous }
      },
      onError: (err, variables, context: any) => {
        if (context?.previous) queryClient.setQueryData(['reviews', slug], context.previous)
        toast.error('Failed to submit review')
      },
      onSuccess: (res) => {
        queryClient.invalidateQueries(['reviews', slug])
        toast.success('Review submitted')
        reset()
      },
    }
  )

  const onSubmit = (data: ReviewInput) => mutation.mutate(data)

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setValue('rating', value || 5)}
              size="large"
            />
            {errors.rating && (
              <Typography variant="caption" color="error">
                {errors.rating.message}
              </Typography>
            )}
          </Box>
          <TextField
            {...register('title')}
            label="Title (optional)"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            {...register('body')}
            label="Review"
            multiline
            rows={4}
            fullWidth
            error={!!errors.body}
            helperText={errors.body?.message}
          />
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit review'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}
