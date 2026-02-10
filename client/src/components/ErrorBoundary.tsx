import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Container, Paper } from '@mui/material'
import { Refresh, Home } from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <Container maxWidth="sm">
          <Box sx={{ py: 6, minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={600} gutterBottom color="error">
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We're sorry. You can try refreshing the page or go back home.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<Refresh />} onClick={this.handleRetry}>
                  Try again
                </Button>
                <Button variant="outlined" startIcon={<Home />} href="/">
                  Go home
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      )
    }
    return this.props.children
  }
}
