import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Stack,
  Typography,
  Box,
} from '@mui/material'
import { Close, Add } from '@mui/icons-material'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    brandId: '',
    isNew: false,
    isBestSeller: false,
    moneyBackGuarantee: false,
  })

  const [variants, setVariants] = useState<
    Array<{
      sku: string
      name: string
      price: string
      discount: string
      stock: string
    }>
  >([{ sku: '', name: '', price: '', discount: '0', stock: '0' }])

  const [images, setImages] = useState<Array<{ url: string; alt: string }>>([{ url: '', alt: '' }])

  const { data: categories } = useQuery(['categories'], async () => {
    const res = await api.get('/categories')
    return res.data.categories || []
  })

  const { data: brands } = useQuery(['brands'], async () => {
    const res = await api.get('/brands')
    return res.data.brands || []
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        moneyBackGuarantee: product.moneyBackGuarantee || false,
      })
      if (product.variants) {
        setVariants(
          product.variants.map((v: any) => ({
            sku: v.sku || '',
            name: v.name || '',
            price: String((v.price || 0) / 100),
            discount: String((v.discount || 0) / 100),
            stock: String(v.stock || 0),
          }))
        )
      }
      if (product.images) {
        setImages(
          product.images.map((img: any) => ({
            url: img.url || '',
            alt: img.alt || '',
          }))
        )
      }
    }
  }, [product])

  const createMutation = useMutation(
    (data: any) => api.post('/admin/products', data),
    {
      onSuccess: () => {
        toast.success('Product created successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to create product')
      },
    }
  )

  const updateMutation = useMutation(
    (data: any) => api.put(`/admin/products/${product?.id}`, data),
    {
      onSuccess: () => {
        toast.success('Product updated successfully')
        onSuccess()
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.error || 'Failed to update product')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      categoryId: formData.categoryId || undefined,
      brandId: formData.brandId || undefined,
      variants: variants
        .filter((v) => v.sku && v.name)
        .map((v) => ({
          sku: v.sku,
          name: v.name,
          price: parseInt(v.price) * 100,
          discount: parseInt(v.discount) * 100,
          stock: parseInt(v.stock),
        })),
      images: images.filter((img) => img.url).map((img) => ({
        url: img.url,
        alt: img.alt || undefined,
      })),
    }

    if (product) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{product ? 'Edit Product' : 'Create Product'}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Slug *"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              required
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {categories?.map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={formData.brandId}
                    label="Brand"
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  >
                    <MenuItem value="">Select brand</MenuItem>
                    {brands?.map((brand: any) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  />
                }
                label="New Product"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                }
                label="Best Seller"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.moneyBackGuarantee}
                    onChange={(e) => setFormData({ ...formData, moneyBackGuarantee: e.target.checked })}
                  />
                }
                label="Money-Back Guarantee"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Variants
              </Typography>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {variants.map((variant, idx) => (
                  <Grid container spacing={2} key={idx}>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].sku = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        placeholder="Name"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].name = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        placeholder="Price (₵)"
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].price = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        placeholder="Discount (₵)"
                        type="number"
                        value={variant.discount}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].discount = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        placeholder="Stock"
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].stock = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  type="button"
                  startIcon={<Add />}
                  onClick={() => setVariants([...variants, { sku: '', name: '', price: '', discount: '0', stock: '0' }])}
                  variant="outlined"
                  size="small"
                >
                  Add Variant
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Images
              </Typography>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {images.map((image, idx) => (
                  <Grid container spacing={2} key={idx}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        placeholder="Image URL"
                        type="url"
                        value={image.url}
                        onChange={(e) => {
                          const newImages = [...images]
                          newImages[idx].url = e.target.value
                          setImages(newImages)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        placeholder="Alt text"
                        value={image.alt}
                        onChange={(e) => {
                          const newImages = [...images]
                          newImages[idx].alt = e.target.value
                          setImages(newImages)
                        }}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  type="button"
                  startIcon={<Add />}
                  onClick={() => setImages([...images, { url: '', alt: '' }])}
                  variant="outlined"
                  size="small"
                >
                  Add Image
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={createMutation.isLoading || updateMutation.isLoading}
        >
          {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
