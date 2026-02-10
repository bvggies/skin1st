import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Container, Stack } from '@mui/material'
import { Home, ArrowBack, Search } from '@mui/icons-material'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 6,
        }}
      >
        <Typography
          variant="h1"
          fontWeight={800}
          sx={{ fontSize: { xs: '4rem', sm: '6rem' }, color: 'primary.main', lineHeight: 1 }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<Home />}
            size="large"
          >
            Go home
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            size="large"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            component={Link}
            to="/shop"
            variant="outlined"
            startIcon={<Search />}
            size="large"
          >
            Browse shop
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}
