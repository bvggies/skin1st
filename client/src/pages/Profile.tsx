import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const ProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional()
})

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ProfileForm = z.infer<typeof ProfileSchema>
type PasswordForm = z.infer<typeof PasswordSchema>

export default function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile')

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(PasswordSchema)
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
      }
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
      }
    }
  )

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Please log in to view your profile</h2>
        <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium ${activeTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 font-medium ${activeTab === 'password' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-3 font-medium ${activeTab === 'addresses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
            >
              Addresses
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  {...registerProfile('name')}
                  className="w-full border p-3 rounded-lg"
                  placeholder="Your name"
                />
                {profileErrors.name && <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  {...registerProfile('email')}
                  type="email"
                  className="w-full border p-3 rounded-lg"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  {...registerProfile('phone')}
                  type="tel"
                  className="w-full border p-3 rounded-lg"
                  placeholder="Your phone number"
                />
                {profileErrors.phone && <p className="text-sm text-red-500 mt-1">{profileErrors.phone.message}</p>}
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit((data) => updatePasswordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword }))} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  className="w-full border p-3 rounded-lg"
                />
                {passwordErrors.currentPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className="w-full border p-3 rounded-lg"
                />
                {passwordErrors.newPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className="w-full border p-3 rounded-lg"
                />
                {passwordErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={updatePasswordMutation.isLoading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'addresses' && (
            <div>
              <p className="text-gray-600">Saved addresses will appear here. You can add addresses during checkout.</p>
              <Link to="/orders" className="text-indigo-600 hover:underline mt-4 inline-block">
                View Order History →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

