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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(Schema),
  })
  const auth = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    try {
      await auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      })
      toast.success('Account created')
      navigate('/')
    } catch (e: any) {
      console.error(e)
      toast.error('Registration failed')
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/skin1st.png"
              alt="Skin1st Beauty Therapy"
              sx={{
                height: 60,
                width: 'auto',
                maxWidth: 250,
              }}
            />
          </Box>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600} sx={{ textAlign: 'center' }}>
          Create account
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <TextField
            {...register('name')}
            label="Full name"
            fullWidth
            margin="normal"
          />
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message as string}
          />
          <TextField
            {...register('password')}
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message as string}
          />
          <TextField
            {...register('phone')}
            label="Phone"
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? 'Creating...' : 'Create account'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
