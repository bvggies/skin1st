import React from 'react'

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Name, email address, and phone number when you create an account</li>
            <li>Delivery address and payment information when you place an order</li>
            <li>Product reviews and ratings</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and updates</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Improve our website and services</li>
            <li>Send you marketing communications (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>With delivery partners to fulfill your orders</li>
            <li>When required by law or to protect our rights</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate security measures to protect your personal information. However, no method of 
            transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. You can 
            control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Access and update your personal information</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us through our contact page.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

