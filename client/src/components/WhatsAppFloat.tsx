import React from 'react'
import { Fab, Tooltip, Zoom } from '@mui/material'
import { WhatsApp } from '@mui/icons-material'

export default function WhatsAppFloat() {
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+1234567890' // Fallback for development
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I want to order')}`

  return (
    <Tooltip
      title="Chat with us on WhatsApp"
      placement="left"
      arrow
      TransitionComponent={Zoom}
    >
      <Fab
        color="success"
        aria-label="WhatsApp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <WhatsApp sx={{ fontSize: 28 }} />
      </Fab>
    </Tooltip>
  )
}

