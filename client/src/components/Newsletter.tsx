import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Stack } from '@mui/material'
import { Email, Send, LocalOffer, Notifications, CardGiftcard } from '@mui/icons-material'
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

  const benefits = [
    { icon: <LocalOffer />, text: 'Exclusive Discounts' },
    { icon: <Notifications />, text: 'New Arrivals' },
    { icon: <CardGiftcard />, text: 'Special Offers' },
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        p: { xs: 4, md: 6 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,69,96,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}
          >
            Stay in the Loop
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, opacity: 0.85, maxWidth: 400 }}
          >
            Subscribe to our newsletter and never miss out on new products, 
            exclusive deals, and beauty tips.
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {benefits.map((benefit, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: '#e94560' }}>{benefit.icon}</Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {benefit.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <TextField
              {...register('email')}
              type="email"
              placeholder="Enter your email address"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#e94560', borderWidth: 2 },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b8a',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              endIcon={<Send />}
              sx={{
                bgcolor: '#e94560',
                color: 'white',
                px: 4,
                py: 1.75,
                borderRadius: 2,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                minWidth: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  bgcolor: '#c73e54',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(233,69,96,0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.6 }}>
            We respect your privacy. Unsubscribe at any time.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}
