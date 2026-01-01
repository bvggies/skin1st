import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShoppingCart, Moon, Sun } from 'lucide-react'
import useCart from '../store/cart'
import { SearchAutocomplete } from './SearchBar'

export default function Header(){
  const cart = useCart(state => state.items)
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold">Skin1st Beauty Therapy</Link>
        <nav className="flex items-center gap-4">
          <div className="hidden md:block w-64">
            <SearchAutocomplete />
          </div>
          <Link to="/shop" className="text-sm">Shop</Link>
          <Link to="/about" className="text-sm">About</Link>
          <Link to="/faq" className="text-sm">FAQ</Link>
          <Link to="/contact" className="text-sm">Contact</Link>
          <a href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I want to order')}`} className="text-sm">WhatsApp</a>
          <button onClick={()=>setDark(d=>!d)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* auth */}
          {(() => {
            try{
              const { user, logout } = useAuth()
              if (user) return (
                <div className="flex items-center gap-3">
                  <Link to="/wishlist" className="text-sm hover:text-indigo-600">Wishlist</Link>
                  <Link to="/orders" className="text-sm hover:text-indigo-600">My Orders</Link>
                  <Link to="/profile" className="text-sm hover:text-indigo-600">Profile</Link>
                  <div className="text-sm">Hi, {user.name || user.email}</div>
                  {user.role==='ADMIN' && <Link to="/admin/orders" className="text-sm hover:text-indigo-600">Admin</Link>}
                  <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
                </div>
              )
              return (<div className="flex items-center gap-3"><Link to="/login" className="text-sm hover:text-indigo-600">Login</Link><Link to="/register" className="text-sm hover:text-indigo-600">Sign up</Link></div>)
            }catch(e){
              return (<div className="flex items-center gap-3"><Link to="/login" className="text-sm hover:text-indigo-600">Login</Link><Link to="/register" className="text-sm hover:text-indigo-600">Sign up</Link></div>)
            }
          })()}
          <Link to="/cart" className="relative inline-flex items-center">
            <ShoppingCart />
            <span className="ml-1 text-sm">Cart</span>
            {cart.length>0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded">{cart.length}</span>}
          </Link>
        </nav>
      </div>
    </header>
  )
}
