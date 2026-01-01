import React, { useState } from 'react'
import { Fab, Tooltip, Zoom, Box, Typography, Paper, IconButton } from '@mui/material'
import { WhatsApp, Close } from '@mui/icons-material'

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false)
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+1234567890'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I want to order')}`

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 1001,
            animation: 'popIn 0.3s ease-out',
            '@keyframes popIn': {
              from: { opacity: 0, transform: 'scale(0.9) translateY(20px)' },
              to: { opacity: 1, transform: 'scale(1) translateY(0)' },
            },
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: 320,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: '#25D366',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhatsApp />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Skin1st Support
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Typically replies instantly
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'white' }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, bgcolor: '#e5ddd5' }}>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 2,
                  borderTopLeftRadius: 0,
                  maxWidth: '85%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="body2">
                  👋 Hi there! Welcome to Skin1st Beauty Therapy.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  How can we help you today?
                </Typography>
              </Box>
            </Box>

            {/* Action */}
            <Box sx={{ p: 2, bgcolor: '#f0f0f0' }}>
              <Fab
                variant="extended"
                component="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: '100%',
                  bgcolor: '#25D366',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#128C7E',
                  },
                  boxShadow: 'none',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                <WhatsApp sx={{ mr: 1 }} />
                Start Chat
              </Fab>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Floating Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Tooltip
          title={isOpen ? 'Close' : 'Chat with us'}
          placement="left"
          arrow
          TransitionComponent={Zoom}
        >
          <Fab
            aria-label="WhatsApp"
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              bgcolor: '#25D366',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#128C7E',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isOpen ? <Close sx={{ fontSize: 28 }} /> : <WhatsApp sx={{ fontSize: 30 }} />}
          </Fab>
        </Tooltip>

        {/* Pulse animation */}
        {!isOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: '#25D366',
              animation: 'pulse-ring 2s infinite',
              zIndex: -1,
              '@keyframes pulse-ring': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 0.4,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(1.5)',
                  opacity: 0,
                },
              },
            }}
          />
        )}
      </Box>
    </>
  )
}
