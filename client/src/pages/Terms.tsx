import React from 'react'
import { Box, Typography, Paper, Container, Divider } from '@mui/material'

export default function Terms() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Terms & Conditions
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ '& > section': { mb: 4 } }}>
          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              By accessing and using Skin1st Beauty Therapy website, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these terms, please do not use our services.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              2. Products and Services
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              We strive to provide accurate product descriptions and images. However, we do not warrant that product
              descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              All products are subject to availability. We reserve the right to discontinue any product at any time.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              3. Pricing and Payment
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              All prices are in Ghana Cedis (₵) and are subject to change without notice. We accept Cash on Delivery
              (COD) as our primary payment method.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Prices displayed are inclusive of applicable taxes. Delivery charges, if any, will be clearly indicated
              during checkout.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              4. Orders and Delivery
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              When you place an order, you will receive an order confirmation. We deliver within 1-3 business days
              across Ghana.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We reserve the right to refuse or cancel any order for any reason, including but not limited to product
              availability, errors in pricing, or suspected fraudulent activity.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              5. Returns and Refunds
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              We provide refunds on eligible products that qualify for our money-back guarantee program. Not all products are eligible for returns or refunds. Products must be unopened and in original packaging to be
              eligible for return.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Please check the product page to see if your item is eligible for returns. Refunds will be processed within 5-7 business days after we receive the returned product. For more
              details, see our Money-Back Guarantee policy.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              6. User Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept
              responsibility for all activities that occur under your account.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              7. Limitation of Liability
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Skin1st Beauty Therapy shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use the service.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              8. Contact Information
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              If you have any questions about these Terms & Conditions, please contact us via our contact page or
              WhatsApp.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
