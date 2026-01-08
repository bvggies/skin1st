import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Stack,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material'
import { Warning, CheckCircle, Cancel } from '@mui/icons-material'

interface AgeVerificationProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function AgeVerification({ open, onConfirm, onCancel }: AgeVerificationProps) {
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleConfirm = () => {
    if (agreed) {
      // Store consent in localStorage
      localStorage.setItem('adultContentConsent', 'true')
      localStorage.setItem('adultContentConsentDate', new Date().toISOString())
      onConfirm()
    }
  }

  const handleCancel = () => {
    navigate('/')
    onCancel()
  }

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
      disableEscapeKeyDown
      onClose={(e, reason) => {
        if (reason === 'backdropClick') {
          handleCancel()
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            bgcolor: '#1a1a2e',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Warning sx={{ fontSize: 60, color: '#e94560', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Age Verification Required
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            You must be 18 years or older to access this section
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Important Notice
            </Typography>
            <Typography variant="body2">
              This section contains adult products intended for individuals who are 18 years of age or older. 
              By proceeding, you confirm that you meet the age requirement and consent to viewing adult content.
            </Typography>
          </Alert>

          <Paper
            elevation={0}
            sx={{
              bgcolor: 'grey.50',
              p: 3,
              mb: 3,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Disclaimer:</strong> By accessing this section, you acknowledge and agree that:
            </Typography>
            <Stack spacing={1} sx={{ textAlign: 'left' }}>
              <Typography variant="body2" color="text.secondary">
                • You are at least 18 years of age
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You consent to viewing adult content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You understand that this website and its operators are not responsible for any consequences 
                  resulting from your access to or use of adult products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You agree to use this section responsibly and in accordance with applicable laws
              </Typography>
            </Stack>
          </Paper>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I confirm that I am 18 years or older and agree to the terms stated above
              </Typography>
            }
            sx={{ mb: 3, alignItems: 'flex-start' }}
          />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              startIcon={<Cancel />}
              sx={{ minWidth: 120 }}
            >
              Exit
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={!agreed}
              startIcon={<CheckCircle />}
              sx={{
                minWidth: 120,
                bgcolor: '#e94560',
                '&:hover': {
                  bgcolor: '#d63651',
                },
              }}
            >
              Enter
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

