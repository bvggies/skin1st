import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { Save, Image as ImageIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function SiteSettings() {
  const qc = useQueryClient()
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    specialOfferTitle: '',
    specialOfferDescription: '',
    specialOfferCode: '',
  })

  const { data, isLoading } = useQuery(
    ['admin:site-settings'],
    async () => {
      const res = await api.get('/admin/site-settings')
      return res.data
    },
    {
      onSuccess: (data) => {
        setFormData({
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          heroImageUrl: data.heroImageUrl || '',
          specialOfferTitle: data.specialOfferTitle || '',
          specialOfferDescription: data.specialOfferDescription || '',
          specialOfferCode: data.specialOfferCode || '',
        })
      },
    }
  )

  const mutation = useMutation(
    (data: typeof formData) => api.put('/admin/site-settings', data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['admin:site-settings'])
        qc.invalidateQueries(['site-settings'])
        toast.success('Site settings updated successfully!')
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to update settings')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Site Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your homepage hero section and special offers
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Hero Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Hero Section
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Hero Title"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    fullWidth
                    required
                    helperText="Main heading displayed in the hero section. Use a new line (press Enter) to split the title - the second line will appear in red."
                    placeholder="Discover Your\nNatural Beauty"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Hero Subtitle"
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    helperText="Subtitle/description text below the title"
                    placeholder="Premium beauty and skin therapy products..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Hero Image URL"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    fullWidth
                    required
                    type="url"
                    helperText="Full URL to the hero image"
                    placeholder="https://images.unsplash.com/photo-..."
                    InputProps={{
                      startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  {formData.heroImageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info" sx={{ mb: 1 }}>
                        Image Preview:
                      </Alert>
                      <Box
                        component="img"
                        src={formData.heroImageUrl}
                        alt="Hero preview"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Special Offer Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Special Offer Section
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Offer Title"
                    value={formData.specialOfferTitle}
                    onChange={(e) => setFormData({ ...formData, specialOfferTitle: e.target.value })}
                    fullWidth
                    required
                    helperText="Title of the special offer (e.g., 'Special Offer - 20% Off')"
                    placeholder="Special Offer - 20% Off"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Offer Description"
                    value={formData.specialOfferDescription}
                    onChange={(e) => setFormData({ ...formData, specialOfferDescription: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={2}
                    helperText="Description text for the offer"
                    placeholder="Use code FIRST20 on your first order. Limited time only!"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Promo Code"
                    value={formData.specialOfferCode}
                    onChange={(e) => setFormData({ ...formData, specialOfferCode: e.target.value.toUpperCase() })}
                    fullWidth
                    required
                    helperText="Promo code for the offer (e.g., FIRST20)"
                    placeholder="FIRST20"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={mutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={mutation.isLoading}
                sx={{ minWidth: 150 }}
              >
                {mutation.isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </AdminLayout>
  )
}

