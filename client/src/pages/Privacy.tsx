import React from 'react'
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Divider } from '@mui/material'

export default function Privacy() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Privacy Policy
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ '& > section': { mb: 4 } }}>
          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              We collect information that you provide directly to us, including:
            </Typography>
            <List sx={{ listStyle: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Name, email address, and phone number when you create an account" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Delivery address and payment information when you place an order" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Product reviews and ratings" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Communication preferences" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              We use the information we collect to:
            </Typography>
            <List sx={{ listStyle: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Process and fulfill your orders" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Send you order confirmations and updates" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Respond to your inquiries and provide customer support" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Improve our website and services" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Send you marketing communications (with your consent)" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information
              only:
            </Typography>
            <List sx={{ listStyle: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="With delivery partners to fulfill your orders" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="When required by law or to protect our rights" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="With your explicit consent" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              4. Data Security
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              5. Cookies
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. You can
              control cookies through your browser settings.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              6. Your Rights
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              You have the right to:
            </Typography>
            <List sx={{ listStyle: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Access and update your personal information" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Request deletion of your account" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Opt-out of marketing communications" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', pl: 1 }}>
                <ListItemText primary="Request a copy of your data" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section">
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              7. Contact Us
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              If you have questions about this Privacy Policy, please contact us through our contact page.
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
