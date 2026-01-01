import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    // Give AuthContext time to load user from refresh token
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isChecking && user === null) {
      navigate('/login', { replace: true })
      return
    }

    // Redirect to home if not admin
    if (!isChecking && user && user.role !== 'ADMIN') {
      navigate('/', { replace: true })
      return
    }
  }, [user, isChecking, navigate])

  // Show loading while checking authentication
  if (isChecking || user === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verifying access...
        </Typography>
      </Box>
    )
  }

  // Don't render if redirecting
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}

