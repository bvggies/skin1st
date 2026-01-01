import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Schema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional(), phone: z.string().optional() })

export default function Register(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(Schema) })
  const auth = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data:any){
    try{
      await auth.register({ email: data.email, password: data.password, name: data.name, phone: data.phone })
      toast.success('Account created')
      navigate('/')
    }catch(e:any){ console.error(e); toast.error('Registration failed') }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Full name</label>
          <input className="w-full border p-2 rounded" {...register('name')} />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border p-2 rounded" {...register('email')} />
          {errors.email && <div className="text-sm text-red-500">{errors.email.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" className="w-full border p-2 rounded" {...register('password')} />
          {errors.password && <div className="text-sm text-red-500">{errors.password.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input className="w-full border p-2 rounded" {...register('phone')} />
        </div>
        <div>
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded">{isSubmitting ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>
    </div>
  )
}