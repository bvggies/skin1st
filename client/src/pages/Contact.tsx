import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  Link,
} from '@mui/material'
import { Phone, WhatsApp, Email, Schedule } from '@mui/icons-material'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof ContactSchema>

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema),
  })

  async function onSubmit(data: ContactForm) {
    try {
      await api.post('/contact', data)
      toast.success('Thank you! We\'ll get back to you soon.')
      reset()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to send message')
    }
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Contact Us
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Phone color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Phone
              </Typography>
            </Box>
            <Link href={`tel:${process.env.REACT_APP_WHATSAPP_NUMBER}`} color="primary" underline="hover">
              {process.env.REACT_APP_WHATSAPP_NUMBER || 'Contact us'}
            </Link>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WhatsApp color="success" />
              <Typography variant="h6" fontWeight={500}>
                WhatsApp
              </Typography>
            </Box>
            <Link
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I need help')}`}
              target="_blank"
              rel="noopener noreferrer"
              color="success.main"
              underline="hover"
            >
              Chat with us on WhatsApp
            </Link>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Email
              </Typography>
            </Box>
            <Link href="mailto:support@skin1st.com" color="primary" underline="hover">
              support@skin1st.com
            </Link>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule color="primary" />
              <Typography variant="h6" fontWeight={500}>
                Business Hours
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Monday - Saturday: 9 AM - 6 PM
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
          Send us a Message
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('name')}
                label="Name *"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('email')}
                label="Email *"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('phone')}
                label="Phone"
                type="tel"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('subject')}
                label="Subject *"
                fullWidth
                required
                error={!!errors.subject}
                helperText={errors.subject?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('message')}
                label="Message *"
                multiline
                rows={6}
                fullWidth
                required
                error={!!errors.message}
                helperText={errors.message?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}
