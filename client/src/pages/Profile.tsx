import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Link,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'

const ProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof ProfileSchema>
type PasswordForm = z.infer<typeof PasswordSchema>

export default function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<number>(0)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(PasswordSchema),
  })

  const updateProfileMutation = useMutation(
    (data: ProfileForm) => api.put('/user/profile', data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully')
        queryClient.invalidateQueries(['user'])
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update profile')
      },
    }
  )

  const updatePasswordMutation = useMutation(
    (data: { currentPassword: string; newPassword: string }) => api.put('/user/password', data),
    {
      onSuccess: () => {
        toast.success('Password updated successfully')
        resetPassword()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update password')
      },
    }
  )

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Please log in to view your profile
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    )
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        My Account
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Profile" />
          <Tab label="Change Password" />
          <Tab label="Addresses" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} sx={{ maxWidth: 500 }}>
              <Stack spacing={3}>
                <TextField
                  {...registerProfile('name')}
                  label="Full Name"
                  fullWidth
                  error={!!profileErrors.name}
                  helperText={profileErrors.name?.message}
                />

                <TextField
                  {...registerProfile('email')}
                  label="Email"
                  type="email"
                  fullWidth
                  disabled
                  helperText="Email cannot be changed"
                />

                <TextField
                  {...registerProfile('phone')}
                  label="Phone"
                  type="tel"
                  fullWidth
                  error={!!profileErrors.phone}
                  helperText={profileErrors.phone?.message}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updateProfileMutation.isLoading}
                  size="large"
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          )}

          {activeTab === 1 && (
            <Box
              component="form"
              onSubmit={handlePasswordSubmit((data) =>
                updatePasswordMutation.mutate({
                  currentPassword: data.currentPassword,
                  newPassword: data.newPassword,
                })
              )}
              sx={{ maxWidth: 500 }}
            >
              <Stack spacing={3}>
                <TextField
                  {...registerPassword('currentPassword')}
                  label="Current Password"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword?.message}
                />

                <TextField
                  {...registerPassword('newPassword')}
                  label="New Password"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword?.message}
                />

                <TextField
                  {...registerPassword('confirmPassword')}
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updatePasswordMutation.isLoading}
                  size="large"
                >
                  {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </Stack>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Saved addresses will appear here. You can add addresses during checkout.
              </Typography>
              <Button component={RouterLink} to="/orders" variant="text" color="primary" sx={{ mt: 2 }}>
                View Order History →
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
