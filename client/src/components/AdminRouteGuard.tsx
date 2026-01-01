import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user } = useAuth()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    // Give AuthContext time to load user from refresh token
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to home if not admin
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

