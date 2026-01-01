import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Admin</h1>
        <nav className="flex gap-3 flex-wrap">
          <Link to="/admin/analytics" className="text-sm hover:text-indigo-600">Analytics</Link>
          <Link to="/admin/orders" className="text-sm hover:text-indigo-600">Orders</Link>
          <Link to="/admin/products" className="text-sm hover:text-indigo-600">Products</Link>
          <Link to="/admin/categories" className="text-sm hover:text-indigo-600">Categories</Link>
          <Link to="/admin/brands" className="text-sm hover:text-indigo-600">Brands</Link>
          <Link to="/admin/coupons" className="text-sm hover:text-indigo-600">Coupons</Link>
          <Link to="/admin/users" className="text-sm hover:text-indigo-600">Users</Link>
          <Link to="/admin/guarantee-claims" className="text-sm hover:text-indigo-600">Guarantee Claims</Link>
        </nav>
      </div>
      <div>{children}</div>
    </div>
  )
}