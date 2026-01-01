import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, TextField, Button, Typography, Paper } from '@mui/material'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Schema = z.object({
  email: z.string().email('Invalid email address'),
})

type Form = z.infer<typeof Schema>

export default function Newsletter() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Form>({
    resolver: zodResolver(Schema),
  })

  async function onSubmit(data: Form) {
    try {
      await api.post('/newsletter.subscribe', data)
      toast.success('Thank you for subscribing!')
      reset()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to subscribe')
    }
  }

  return (
    <Paper
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Subscribe to Our Newsletter
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
        Get updates on new products, special offers, and beauty tips!
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          {...register('email')}
          type="email"
          placeholder="Enter your email"
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          size="small"
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: 'background.paper',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100',
            },
            whiteSpace: 'nowrap',
          }}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </Box>
    </Paper>
  )
}
