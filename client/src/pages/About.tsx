import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
} from '@mui/material'
import { CheckCircle, WhatsApp } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        About Skin1st Beauty Therapy
      </Typography>

      <Stack spacing={4} sx={{ mt: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Our Story
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Skin1st Beauty Therapy was founded with a simple mission: to provide premium beauty and skin therapy
            products that help you look and feel your best. We understand that your skin is unique, and we're
            committed to offering products that are effective, safe, and suitable for all skin types.
          </Typography>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Our Values
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Quality First
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We source only the highest quality products from trusted manufacturers and authorized distributors.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Customer Satisfaction
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your satisfaction is our priority. We offer a 30-day money-back guarantee on all products.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Fast Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We deliver across Ghana within 1-3 business days, so you get your products quickly.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Transparency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We provide detailed product information, ingredients, and honest customer reviews.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Why Choose Us?
          </Typography>
          <List sx={{ mt: 1 }}>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body1" color="text.secondary">
                <strong>Authentic Products:</strong> 100% genuine products with full manufacturer warranty
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body1" color="text.secondary">
                <strong>Money-Back Guarantee:</strong> Not satisfied? Get a full refund within 30 days
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body1" color="text.secondary">
                <strong>Fast Delivery:</strong> 1-3 day delivery across Ghana with free shipping
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body1" color="text.secondary">
                <strong>Cash on Delivery:</strong> Pay when you receive your order - no upfront payment required
              </Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body1" color="text.secondary">
                <strong>Expert Support:</strong> Our team is here to help you find the right products
              </Typography>
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Our Commitment
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
            At Skin1st Beauty Therapy, we're committed to providing you with the best shopping experience. From
            product selection to delivery and after-sales support, we're here for you every step of the way.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            We believe that everyone deserves access to quality beauty and skincare products, and we're proud to serve
            customers across Ghana with fast, reliable service and genuine products.
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Get in Touch
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Have questions or need help? We're here for you!
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I'd like to know more")}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="success"
              startIcon={<WhatsApp />}
            >
              WhatsApp Us
            </Button>
            <Button component={Link} to="/contact" variant="contained" color="primary">
              Contact Us
            </Button>
            <Button component={Link} to="/shop" variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
              Shop Now
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
