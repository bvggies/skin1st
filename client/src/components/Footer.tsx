import React from 'react'
import { Link } from 'react-router-dom'
import Newsletter from './Newsletter'

export default function Footer(){
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Newsletter />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-3">Skin1st Beauty Therapy</h3>
            <p className="text-sm text-gray-600">
              Premium beauty and skin therapy products. Quality you can trust.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 hover:text-indigo-600">Home</Link></li>
              <li><Link to="/shop" className="text-gray-600 hover:text-indigo-600">Shop</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-indigo-600">About Us</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-indigo-600">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">My Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="text-gray-600 hover:text-indigo-600">Profile</Link></li>
              <li><Link to="/orders" className="text-gray-600 hover:text-indigo-600">My Orders</Link></li>
              <li><Link to="/wishlist" className="text-gray-600 hover:text-indigo-600">Wishlist</Link></li>
              <li><Link to="/orders/track" className="text-gray-600 hover:text-indigo-600">Track Order</Link></li>
              <li><Link to="/guarantee/claim" className="text-gray-600 hover:text-indigo-600">Money-Back Guarantee</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}`} className="text-gray-600 hover:text-indigo-600" target="_blank" rel="noopener noreferrer">Contact WhatsApp</a></li>
              <li className="text-gray-600">Delivery: 1-3 days</li>
              <li className="text-gray-600">Payment: Cash on Delivery</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-600 hover:text-indigo-600">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-indigo-600">Privacy Policy</Link></li>
              <li><Link to="/guarantee/claim" className="text-gray-600 hover:text-indigo-600">Money-Back Guarantee</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Skin1st Beauty Therapy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
