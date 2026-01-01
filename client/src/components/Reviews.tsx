import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const ReviewSchema = z.object({ rating: z.number().min(1).max(5), title: z.string().max(100).optional(), body: z.string().max(1000).optional() })
type ReviewInput = z.infer<typeof ReviewSchema>

export function ReviewsList({ slug }: { slug: string }){
  const { data, isLoading } = useQuery(['reviews', slug], async ()=>{ const r = await api.get(`/products/${slug}/reviews`); return r.data.reviews })
  if (isLoading) return <div>Loading reviews...</div>
  return (
    <div className="space-y-4">
      {data.map((rev:any)=> (
        <div key={rev.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <div className="font-medium">{rev.title || `Rating ${rev.rating}/5`}</div>
          <div className="text-sm text-gray-500">by {rev.user?.name || 'Anonymous'} • {new Date(rev.createdAt).toLocaleDateString()}</div>
          <div className="mt-2">{rev.body}</div>
        </div>
      ))}
    </div>
  )
}

export function ReviewForm({ slug }: { slug: string }){
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewInput>({ resolver: zodResolver(ReviewSchema), defaultValues: { rating: 5, title: '', body: '' } })

  const mutation = useMutation((payload: ReviewInput) => api.post(`/products/${slug}/reviews`, payload), {
    onMutate: async (newReview) => {
      await queryClient.cancelQueries(['reviews', slug])
      const previous = queryClient.getQueryData<any[]>(['reviews', slug]) || []
      const optimistic = [{ id: `temp-${Date.now()}`, createdAt: new Date().toISOString(), user: null, ...newReview }, ...previous]
      queryClient.setQueryData(['reviews', slug], optimistic)
      return { previous }
    },
    onError: (err, variables, context:any) => {
      if (context?.previous) queryClient.setQueryData(['reviews', slug], context.previous)
      toast.error('Failed to submit review')
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['reviews', slug])
      toast.success('Review submitted')
      reset()
    }
  })

  const onSubmit = (data: ReviewInput) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label className="block text-sm">Rating</label>
        <select {...register('rating', { valueAsNumber: true })} className="border p-2 rounded">
          {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
        {errors.rating && <div className="text-sm text-red-500">{errors.rating.message}</div>}
      </div>
      <div>
        <label className="block text-sm">Title</label>
        <input {...register('title')} className="w-full border p-2 rounded" />
        {errors.title && <div className="text-sm text-red-500">{errors.title.message}</div>}
      </div>
      <div>
        <label className="block text-sm">Review</label>
        <textarea {...register('body')} className="w-full border p-2 rounded" />
        {errors.body && <div className="text-sm text-red-500">{errors.body.message}</div>}
      </div>
      <div>
        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded">{isSubmitting ? 'Submitting...' : 'Submit review'}</button>
      </div>
    </form>
  )
}