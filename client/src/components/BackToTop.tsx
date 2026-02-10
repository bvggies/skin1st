import React, { useState, useEffect } from 'react'
import { Box, Fab, Zoom } from '@mui/material'
import { KeyboardArrowUp } from '@mui/icons-material'

const SCROLL_THRESHOLD = 400

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Zoom in={visible}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1100,
        }}
      >
        <Fab
          color="primary"
          size="medium"
          aria-label="Back to top"
          onClick={scrollToTop}
          sx={{
            bgcolor: 'primary.main',
            boxShadow: '0 4px 14px rgba(26,26,46,0.25)',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Box>
    </Zoom>
  )
}
