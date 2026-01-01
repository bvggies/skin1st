import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Schema = z.object({
  orderCode: z.string().min(1, 'Order code is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)')
})

type Form = z.infer<typeof Schema>

export default function GuaranteeClaim() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(Schema)
  })
  const navigate = useNavigate()

  async function onSubmit(data: Form) {
    try {
      const res = await api.post('/guarantee.claim', {
        orderCode: data.orderCode.toUpperCase(),
        reason: data.reason
      })
      toast.success('Guarantee claim submitted successfully! We will review it shortly.')
      navigate(`/orders/track?code=${data.orderCode.toUpperCase()}`)
    } catch (e: any) {
      console.error(e)
      const errorMsg = e.response?.data?.error || 'Failed to submit guarantee claim'
      toast.error(errorMsg)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Money-Back Guarantee Claim</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Our Guarantee</h3>
        <p className="text-sm text-blue-800">
          We offer a 30-day money-back guarantee on all products. If you're not satisfied with your purchase,
          you can file a claim for a full refund. Claims are typically reviewed within 2-3 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Order Code *</label>
          <input
            type="text"
            {...register('orderCode')}
            placeholder="ORD-XXXXXXX"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.orderCode && (
            <p className="text-sm text-red-500 mt-1">{errors.orderCode.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Enter the order code from your order confirmation</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason for Claim *</label>
          <textarea
            rows={5}
            {...register('reason')}
            placeholder="Please describe why you're requesting a refund..."
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.reason && (
            <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Please provide detailed information about why you're requesting a refund
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your order must be in "Delivered", "Paid", or "Completed" status to file a claim.
            Refunds will be processed within 5-7 business days after approval.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Guarantee Claim'}
        </button>
      </form>
    </div>
  )
}

