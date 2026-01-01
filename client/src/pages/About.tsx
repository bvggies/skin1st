import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About Skin1st Beauty Therapy</h1>

      <div className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Skin1st Beauty Therapy was founded with a simple mission: to provide premium beauty and skin therapy 
            products that help you look and feel your best. We understand that your skin is unique, and we're 
            committed to offering products that are effective, safe, and suitable for all skin types.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Quality First</h3>
              <p className="text-gray-700 text-sm">
                We source only the highest quality products from trusted manufacturers and authorized distributors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-700 text-sm">
                Your satisfaction is our priority. We offer a 30-day money-back guarantee on all products.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-700 text-sm">
                We deliver across Ghana within 1-3 business days, so you get your products quickly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Transparency</h3>
              <p className="text-gray-700 text-sm">
                We provide detailed product information, ingredients, and honest customer reviews.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Why Choose Us?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Authentic Products:</strong> 100% genuine products with full manufacturer warranty</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Money-Back Guarantee:</strong> Not satisfied? Get a full refund within 30 days</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Fast Delivery:</strong> 1-3 day delivery across Ghana with free shipping</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Cash on Delivery:</strong> Pay when you receive your order - no upfront payment required</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Expert Support:</strong> Our team is here to help you find the right products</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Our Commitment</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Skin1st Beauty Therapy, we're committed to providing you with the best shopping experience. 
            From product selection to delivery and after-sales support, we're here for you every step of the way.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We believe that everyone deserves access to quality beauty and skincare products, and we're proud 
            to serve customers across Ghana with fast, reliable service and genuine products.
          </p>
        </section>

        <section className="bg-indigo-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Get in Touch</h2>
          <p className="text-gray-700 mb-4">
            Have questions or need help? We're here for you!
          </p>
          <div className="flex gap-4">
            <a
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I\'d like to know more')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              WhatsApp Us
            </a>
            <Link
              to="/contact"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Contact Us
            </Link>
            <Link
              to="/shop"
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

