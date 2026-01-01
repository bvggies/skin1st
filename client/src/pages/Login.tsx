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
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(Schema),
  })
  const auth = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    try {
      const result = await auth.login(data.email, data.password)
      toast.success('Logged in')
      // Redirect admins to admin dashboard, regular users to home
      if (result?.user?.role === 'ADMIN') {
        navigate('/admin/orders')
      } else {
        navigate('/')
      }
    } catch (e: any) {
      console.error(e)
      toast.error('Login failed')
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Admin users can login here to access the admin dashboard.
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
