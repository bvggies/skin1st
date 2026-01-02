import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
} from '@mui/material'
import { ExpandMore, WhatsApp } from '@mui/icons-material'

const faqs = [
  {
    category: 'Orders',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'You can place an order by adding products to your cart and proceeding to checkout. Fill in your delivery details and place your order. We accept Cash on Delivery (COD).',
      },
      {
        q: 'How long does delivery take?',
        a: 'We deliver within 1-3 business days across Ghana. Delivery times may vary based on your location.',
      },
      {
        q: 'Can I track my order?',
        a: "Yes! You can track your order using your order code on our Order Tracking page. We'll also send you updates via WhatsApp and email.",
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept Cash on Delivery (COD). You pay when you receive your order.',
      },
      {
        q: 'Can I cancel my order?',
        a: "You can cancel your order before it's confirmed. Once confirmed, please contact us via WhatsApp or email to discuss cancellation.",
      },
    ],
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are your products authentic?',
        a: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors.',
      },
      {
        q: 'Do you offer samples?',
        a: "We don't currently offer samples, but we have a 30-day money-back guarantee on eligible products if you're not satisfied.",
      },
      {
        q: 'How do I know which product is right for me?',
        a: 'Each product page has detailed descriptions, ingredients, and usage instructions. You can also contact us for personalized recommendations.',
      },
      {
        q: 'Are products suitable for sensitive skin?',
        a: 'Many of our products are suitable for sensitive skin. Check the product description and ingredients list. If you have concerns, consult with a dermatologist or contact us.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day money-back guarantee on eligible products. Products must be unopened and in original packaging. Please check the product page to see if your item is eligible for returns. Contact us to initiate a return.',
      },
      {
        q: 'How do I return a product?',
        a: "Contact us via WhatsApp or email with your order number and reason for return. We'll arrange for product pickup and process your refund within 5-7 business days.",
      },
      {
        q: 'How long does a refund take?',
        a: 'Refunds are processed within 5-7 business days after we receive the returned product.',
      },
      {
        q: 'Can I exchange a product?',
        a: 'Yes, you can exchange a product for a different variant or product. Contact us to arrange an exchange.',
      },
    ],
  },
  {
    category: 'Account & Shipping',
    questions: [
      {
        q: 'Do I need an account to order?',
        a: 'No, you can order as a guest. However, creating an account allows you to track orders, view order history, and save your information for faster checkout.',
      },
      {
        q: "How do I create an account?",
        a: 'Click "Sign up" in the header, enter your email and password, and you\'re all set!',
      },
      {
        q: 'Where do you deliver?',
        a: 'We deliver across Ghana. Delivery is free and takes 1-3 business days.',
      },
      {
        q: "What if I'm not available for delivery?",
        a: "We'll contact you before delivery. If you're not available, we'll arrange a convenient time for redelivery.",
      },
    ],
  },
]

export default function FAQ() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Frequently Asked Questions
      </Typography>

      <Box sx={{ mt: 4 }}>
        {faqs.map((category, catIdx) => (
          <Accordion key={catIdx} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" fontWeight={600}>
                {category.category}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {category.questions.map((faq, qIdx) => (
                  <Accordion key={qIdx} sx={{ mb: 1, boxShadow: 'none', borderLeft: 2, borderColor: 'primary.main' }}>
                    <AccordionSummary expandIcon={<ExpandMore color="primary" />}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {faq.q}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.a}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Paper sx={{ p: 4, mt: 4, bgcolor: 'primary.light', textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Still have questions?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We're here to help! Contact us via WhatsApp or email.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Button
            href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I have a question')}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            startIcon={<WhatsApp />}
          >
            WhatsApp Us
          </Button>
          <Button component="a" href="/contact" variant="contained" color="primary">
            Contact Form
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
