import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Schema = z.object({
  email: z.string().email('Invalid email address')
})

type Form = z.infer<typeof Schema>

export default function Newsletter() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Form>({
    resolver: zodResolver(Schema)
  })

  async function onSubmit(data: Form) {
    try {
      await api.post('/newsletter.subscribe', data)
      toast.success('Thank you for subscribing!')
      reset()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to subscribe')
    }
  }

  return (
    <div className="bg-indigo-600 text-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
      <p className="text-sm text-indigo-100 mb-4">
        Get updates on new products, special offers, and beauty tips!
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <input
          {...register('email')}
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 rounded text-gray-900"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-indigo-600 px-6 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {errors.email && (
        <p className="text-sm text-red-200 mt-2">{errors.email.message}</p>
      )}
    </div>
  )
}

