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
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import { Email, Lock, Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Schema = z.object({ 
  email: z.string().email('Please enter a valid email'), 
  password: z.string().min(1, 'Password is required') 
})

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(Schema),
  })
  const auth = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    try {
      const result = await auth.login(data.email, data.password)
      toast.success('Welcome back!')
      if (result?.user?.role === 'ADMIN') {
        navigate('/admin/orders')
      } else {
      navigate('/')
      }
    } catch (e: any) {
      console.error(e)
      toast.error('Invalid email or password')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#fafafa',
      }}
    >
      {/* Left side - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ mb: 4 }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: 'inline-block', mb: 4 }}
            >
              <Box
                component="img"
                src="/skin1st.png"
                alt="Skin1st"
                sx={{ height: 50, width: 'auto', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue shopping
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email')}
              label="Email address"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message as string}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message as string}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              endIcon={!isSubmitting && <ArrowForward />}
              sx={{
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: '#1a1a2e',
                '&:hover': {
                  bgcolor: '#16213e',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(26,26,46,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                New to Skin1st?
              </Typography>
            </Divider>

            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderWidth: 2,
                borderColor: '#1a1a2e',
                color: '#1a1a2e',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(26,26,46,0.05)',
                },
              }}
            >
              Create an Account
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right side - Image/Pattern */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(233,69,96,0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,52,96,0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Box sx={{ textAlign: 'center', color: 'white', px: 6, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Premium Beauty
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
            Skin Therapy Products
          </Typography>
          <Stack spacing={2}>
            {['Fast 1-3 day delivery', 'Cash on delivery', '100% money-back guarantee'].map((text, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#e94560',
                  }}
                />
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
