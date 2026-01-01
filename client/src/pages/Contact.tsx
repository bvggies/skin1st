import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactForm = z.infer<typeof ContactSchema>

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({
    resolver: zodResolver(ContactSchema)
  })

  async function onSubmit(data: ContactForm) {
    try {
      await api.post('/contact', data)
      toast.success('Thank you! We\'ll get back to you soon.')
      reset()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to send message')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Contact Us</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <a href={`tel:${process.env.REACT_APP_WHATSAPP_NUMBER}`} className="text-indigo-600 hover:underline">
              {process.env.REACT_APP_WHATSAPP_NUMBER || 'Contact us'}
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-2">WhatsApp</h3>
            <a
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I need help')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Email</h3>
            <a href="mailto:support@skin1st.com" className="text-indigo-600 hover:underline">
              support@skin1st.com
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Business Hours</h3>
            <p className="text-gray-600">Monday - Saturday: 9 AM - 6 PM</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              {...register('name')}
              className="w-full border p-3 rounded-lg"
              placeholder="Your name"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              {...register('email')}
              type="email"
              className="w-full border p-3 rounded-lg"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full border p-3 rounded-lg"
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject *</label>
          <input
            {...register('subject')}
            className="w-full border p-3 rounded-lg"
            placeholder="What is this about?"
          />
          {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message *</label>
          <textarea
            {...register('message')}
            rows={6}
            className="w-full border p-3 rounded-lg"
            placeholder="Tell us how we can help..."
          />
          {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

