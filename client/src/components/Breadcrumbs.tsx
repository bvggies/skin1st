import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material'
import { NavigateNext, Home } from '@mui/icons-material'

interface Crumb {
  label: string
  path?: string
}

const pathToLabel: Record<string, string> = {
  shop: 'Shop',
  cart: 'Cart',
  checkout: 'Checkout',
  'order-confirmation': 'Order confirmation',
  login: 'Login',
  register: 'Register',
  profile: 'Profile',
  orders: 'My orders',
  wishlist: 'Wishlist',
  contact: 'Contact',
  faq: 'FAQ',
  about: 'About',
  terms: 'Terms & conditions',
  privacy: 'Privacy policy',
  'adult-shop': 'Adult shop',
  'guarantee/claim': 'Guarantee claim',
}

export default function Breadcrumbs({ extraCrumbs = [] }: { extraCrumbs?: Crumb[] }) {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)

  const crumbs: Crumb[] = [{ label: 'Home', path: '/' }]
  let acc = ''
  pathnames.forEach((segment, i) => {
    acc += `/${segment}`
    const isLast = i === pathnames.length - 1 && extraCrumbs.length === 0
    const label = pathToLabel[segment] || segment.replace(/-/g, ' ')
    crumbs.push({
      label: isLast && extraCrumbs.length === 0 ? label : label.charAt(0).toUpperCase() + label.slice(1),
      path: isLast ? undefined : acc,
    })
  })
  const allCrumbs = extraCrumbs.length
    ? [...crumbs.slice(0, Math.max(1, crumbs.length - extraCrumbs.length)), ...extraCrumbs]
    : crumbs

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="Breadcrumb"
        sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
      >
        {allCrumbs.map((crumb, i) =>
          crumb.path && i < allCrumbs.length - 1 ? (
            <Link
              key={crumb.path}
              component={RouterLink}
              to={crumb.path}
              color="text.secondary"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {i === 0 ? <Home fontSize="small" /> : null}
              {crumb.label}
            </Link>
          ) : (
            <Typography key={i} color="text.primary" fontWeight={500}>
              {crumb.label}
            </Typography>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  )
}
