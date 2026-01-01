import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import { Email, Lock, Person, Phone, Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
})

export default function Register() {
  const [showPassword, setShowPassword] = React.useState(false)
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
      toast.success('Welcome to Skin1st!')
      navigate('/')
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.error || 'Registration failed')
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
      {/* Left side - Image/Pattern */}
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
            top: '10%',
            left: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(233,69,96,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,52,96,0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <Box sx={{ textAlign: 'center', color: 'white', px: 6, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Join Our Beauty
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
            Community Today
          </Typography>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"
            alt="Beauty Products"
            sx={{
              width: 280,
              height: 280,
              objectFit: 'cover',
              borderRadius: 4,
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
          />
        </Box>
      </Box>

      {/* Right side - Form */}
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
              Create account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Skin1st and start your beauty journey
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('name')}
              label="Full name"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message as string}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'grey.400' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
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
              {...register('phone')}
              label="Phone number (optional)"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'grey.400' }} />
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
                bgcolor: '#e94560',
                '&:hover': {
                  bgcolor: '#c73e54',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(233,69,96,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#1a1a2e' }}>Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#1a1a2e' }}>Privacy Policy</Link>
            </Typography>

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Button
              component={Link}
              to="/login"
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
              Sign In Instead
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
