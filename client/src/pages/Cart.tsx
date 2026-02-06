import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useCart from '../store/cart'
import api from '../api/axios'

export default function Cart() {
  const items = useCart((state) => state.items)
  const update = useCart((state) => state.update)
  const remove = useCart((state) => state.remove)
  const clear = useCart((state) => state.clear)
  const navigate = useNavigate()

  const ids = items.map((i) => i.variantId)
  const { data, isLoading } = useQuery(
    ['variants', ids],
    async () => {
      if (ids.length === 0) return { variants: [] }
      const res = await api.get(`/variants?ids=${ids.join(',')}`)
      return res.data
    },
    { enabled: ids.length > 0, staleTime: 60 * 1000 } // API is cached
  )

  const subtotal = (data?.variants || []).reduce((s: any, v: any) => {
    const qty = items.find((it: any) => it.variantId === v.id)?.quantity || 0
    const price = v.price - (v.discount || 0)
    return s + price * qty
  }, 0)

  if (items.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Cart
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Your cart is empty.
          </Typography>
          <Button component={Link} to="/shop" variant="contained" color="primary" sx={{ mt: 2 }}>
            Shop now
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Cart
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((it) => {
            const v = data?.variants?.find((x: any) => x.id === it.variantId)
            return (
              <Paper key={it.variantId} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div">
                      {v ? `${v.product.name} — ${v.name}` : `Variant ${it.variantId}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity:
                      </Typography>
                      <TextField
                        type="number"
                        value={it.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          update(it.variantId, Number(e.target.value))
                        }
                        size="small"
                        inputProps={{ min: 1, style: { width: 60, textAlign: 'center' } }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right', mr: 2 }}>
                    {v && (
                      <Typography variant="h6" component="div" fontWeight={600}>
                        ₵{(((v.price - (v.discount || 0)) / 100) * it.quantity).toFixed(2)}
                      </Typography>
                    )}
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => remove(it.variantId)}
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )
          })}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={() => clear()} color="inherit" size="small">
              Clear cart
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" component="div" gutterBottom>
                Subtotal: ₵{(subtotal / 100).toFixed(2)}
              </Typography>
              <Button
                onClick={() => navigate('/checkout')}
                variant="contained"
                color="primary"
                size="large"
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
