import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export default function Login(){
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(Schema) })
  const auth = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data:any){
    try{
      await auth.login(data.email, data.password)
      toast.success('Logged in')
      navigate('/')
    }catch(e:any){ console.error(e); toast.error('Login failed') }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded">{isSubmitting ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}