import React, { useState } from 'react'

const faqs = [
  {
    category: 'Orders',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'You can place an order by adding products to your cart and proceeding to checkout. Fill in your delivery details and place your order. We accept Cash on Delivery (COD).'
      },
      {
        q: 'How long does delivery take?',
        a: 'We deliver within 1-3 business days across Ghana. Delivery times may vary based on your location.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! You can track your order using your order code on our Order Tracking page. We\'ll also send you updates via WhatsApp and email.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept Cash on Delivery (COD). You pay when you receive your order.'
      },
      {
        q: 'Can I cancel my order?',
        a: 'You can cancel your order before it\'s confirmed. Once confirmed, please contact us via WhatsApp or email to discuss cancellation.'
      }
    ]
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are your products authentic?',
        a: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors.'
      },
      {
        q: 'Do you offer samples?',
        a: 'We don\'t currently offer samples, but we have a 30-day money-back guarantee if you\'re not satisfied.'
      },
      {
        q: 'How do I know which product is right for me?',
        a: 'Each product page has detailed descriptions, ingredients, and usage instructions. You can also contact us for personalized recommendations.'
      },
      {
        q: 'Are products suitable for sensitive skin?',
        a: 'Many of our products are suitable for sensitive skin. Check the product description and ingredients list. If you have concerns, consult with a dermatologist or contact us.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day money-back guarantee. Products must be unopened and in original packaging. Contact us to initiate a return.'
      },
      {
        q: 'How do I return a product?',
        a: 'Contact us via WhatsApp or email with your order number and reason for return. We\'ll arrange for product pickup and process your refund within 5-7 business days.'
      },
      {
        q: 'How long does a refund take?',
        a: 'Refunds are processed within 5-7 business days after we receive the returned product.'
      },
      {
        q: 'Can I exchange a product?',
        a: 'Yes, you can exchange a product for a different variant or product. Contact us to arrange an exchange.'
      }
    ]
  },
  {
    category: 'Account & Shipping',
    questions: [
      {
        q: 'Do I need an account to order?',
        a: 'No, you can order as a guest. However, creating an account allows you to track orders, view order history, and save your information for faster checkout.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Sign up" in the header, enter your email and password, and you\'re all set!'
      },
      {
        q: 'Where do you deliver?',
        a: 'We deliver across Ghana. Delivery is free and takes 1-3 business days.'
      },
      {
        q: 'What if I\'m not available for delivery?',
        a: 'We\'ll contact you before delivery. If you\'re not available, we\'ll arrange a convenient time for redelivery.'
      }
    ]
  }
]

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map((category, catIdx) => (
          <div key={catIdx} className="bg-white rounded-lg shadow">
            <button
              onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
              className="w-full p-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50 rounded-lg"
            >
              <span>{category.category}</span>
              <span>{openCategory === category.category ? '−' : '+'}</span>
            </button>

            {openCategory === category.category && (
              <div className="px-4 pb-4 space-y-2">
                {category.questions.map((faq, qIdx) => {
                  const questionId = `${catIdx}-${qIdx}`
                  return (
                    <div key={qIdx} className="border-l-2 border-indigo-200 pl-4">
                      <button
                        onClick={() => setOpenQuestion(openQuestion === questionId ? null : questionId)}
                        className="w-full text-left font-medium py-2 flex items-center justify-between"
                      >
                        <span>{faq.q}</span>
                        <span className="text-indigo-600">{openQuestion === questionId ? '−' : '+'}</span>
                      </button>
                      {openQuestion === questionId && (
                        <p className="text-gray-600 py-2">{faq.a}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">We're here to help! Contact us via WhatsApp or email.</p>
        <div className="flex gap-4 justify-center">
          <a
            href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I have a question')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            WhatsApp Us
          </a>
          <a
            href="/contact"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Contact Form
          </a>
        </div>
      </div>
    </div>
  )
}

