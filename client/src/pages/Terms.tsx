import React from 'react'

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Terms & Conditions</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using Skin1st Beauty Therapy website, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Products and Services</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We strive to provide accurate product descriptions and images. However, we do not warrant that product 
            descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
          </p>
          <p className="text-gray-700 leading-relaxed">
            All products are subject to availability. We reserve the right to discontinue any product at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Pricing and Payment</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            All prices are in Ghana Cedis (₵) and are subject to change without notice. We accept Cash on Delivery (COD) 
            as our primary payment method.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Prices displayed are inclusive of applicable taxes. Delivery charges, if any, will be clearly indicated 
            during checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Orders and Delivery</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            When you place an order, you will receive an order confirmation. We deliver within 1-3 business days across Ghana.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to refuse or cancel any order for any reason, including but not limited to product 
            availability, errors in pricing, or suspected fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Returns and Refunds</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We offer a 30-day money-back guarantee. Products must be unopened and in original packaging to be eligible 
            for return.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Refunds will be processed within 5-7 business days after we receive the returned product. For more details, 
            see our Money-Back Guarantee policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
            responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            Skin1st Beauty Therapy shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms & Conditions, please contact us via our contact page or WhatsApp.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

