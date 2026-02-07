import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  Tabs,
  Tab,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  Alert,
  Switch,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  InputAdornment,
  alpha,
} from '@mui/material'
import {
  Close,
  Add,
  Delete,
  CloudUpload,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  Visibility,
  AttachMoney,
  Inventory,
  LocalOffer,
  Info,
  Help,
  LocalShipping,
  MonetizationOn,
  Science,
  Spa,
  QuestionAnswer,
} from '@mui/icons-material'
import api from '../../api/axios'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface FAQItem {
  question: string
  answer: string
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Basic Info
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    brandId: '',
    isNew: false,
    isBestSeller: false,
    moneyBackGuarantee: false,
    eligibleForReturn: true,
    isAdult: false,
    // New fields
    howToUse: '',
    ingredients: '',
    pricingPackaging: '',
    deliveryReturns: '',
  })

  // Variants
  const [variants, setVariants] = useState<
    Array<{
      sku: string
      name: string
      price: string
      discount: string
      stock: string
    }>
  >([{ sku: '', name: '', price: '', discount: '0', stock: '0' }])

  // Images
  const [images, setImages] = useState<Array<{ url: string; alt: string; uploading?: boolean }>>([])

  // FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: '', answer: '' }])

  const { data: categories } = useQuery(
    ['categories'],
    async () => {
      const res = await api.get('/categories')
      return res.data.categories || []
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const { data: brands } = useQuery(
    ['brands'],
    async () => {
      const res = await api.get('/brands')
      return res.data.brands || []
    },
    { staleTime: 5 * 60 * 1000 }
  )

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
        eligibleForReturn: product.eligibleForReturn !== undefined ? product.eligibleForReturn : true,
        isAdult: product.isAdult || false,
        howToUse: product.howToUse || '',
        ingredients: product.ingredients || '',
        pricingPackaging: product.pricingPackaging || '',
        deliveryReturns: product.deliveryReturns || '',
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
      if (product.images && product.images.length > 0) {
        setImages(
          product.images.map((img: any) => ({
            url: img.url || '',
            alt: img.alt || '',
          }))
        )
      }
      if (product.faq) {
        try {
          const parsedFaq = JSON.parse(product.faq)
          if (Array.isArray(parsedFaq) && parsedFaq.length > 0) {
            setFaqs(parsedFaq)
          }
        } catch (e) {
          // Invalid JSON, use default
        }
      }
    }
  }, [product])

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    })
  }

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const newImageIndex = images.length
    setImages([...images, { url: '', alt: file.name, uploading: true }])

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          const res = await api.post('/upload.image', { file: base64, alt: file.name })
          const newImages = [...images]
          newImages[newImageIndex] = { url: res.data.url, alt: file.name, uploading: false }
          setImages(newImages)
          toast.success('Image uploaded successfully')
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to upload image')
          setImages(images.filter((_, i) => i !== newImageIndex))
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to read file')
      setUploading(false)
      setImages(images.filter((_, i) => i !== newImageIndex))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(handleImageUpload)
    }
    e.target.value = ''
  }

  const addImageUrl = () => {
    setImages([...images, { url: '', alt: '' }])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

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
      onSuccess: (response) => {
        toast.success('Product updated successfully')
        onSuccess()
      },
      onError: (e: any) => {
        const errorMessage = e.response?.data?.error || e.message || 'Failed to update product'
        console.error('Update error:', e)
        toast.error(Array.isArray(errorMessage) ? errorMessage.map((err: any) => err.message || err).join(', ') : errorMessage)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      setActiveTab(0)
      return
    }

    const validVariants = variants.filter((v) => v.sku && v.name && v.price)
    if (validVariants.length === 0) {
      toast.error('At least one variant is required')
      setActiveTab(1)
      return
    }

    const validFaqs = faqs.filter((f) => f.question && f.answer)

    const submitData = {
      ...formData,
      // Send null for empty nullable fields instead of undefined
      categoryId: formData.categoryId ? formData.categoryId : null,
      brandId: formData.brandId ? formData.brandId : null,
      faq: validFaqs.length > 0 ? JSON.stringify(validFaqs) : null,
      // Handle nullable string fields
      howToUse: formData.howToUse || null,
      ingredients: formData.ingredients || null,
      pricingPackaging: formData.pricingPackaging || null,
      deliveryReturns: formData.deliveryReturns || null,
      variants: validVariants.map((v) => ({
        sku: v.sku,
        name: v.name,
        price: Math.round(parseFloat(v.price) * 100),
        discount: Math.round(parseFloat(v.discount || '0') * 100),
        stock: parseInt(v.stock || '0'),
      })),
      images: images.filter((img) => img.url && !img.uploading).map((img) => ({
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

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <Dialog 
      open 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '95vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#1a1a2e',
          color: 'white',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#e94560' }}>
            {product ? <Inventory /> : <Add />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {product ? 'Edit Product' : 'Create New Product'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {product ? `Editing: ${product.name}` : 'Add a new product to your catalog'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab icon={<Info />} iconPosition="start" label="Basic Info" />
          <Tab icon={<AttachMoney />} iconPosition="start" label="Pricing & Variants" />
          <Tab icon={<ImageIcon />} iconPosition="start" label="Images" />
          <Tab icon={<Science />} iconPosition="start" label="Details" />
          <Tab icon={<QuestionAnswer />} iconPosition="start" label="FAQ" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Tab 0: Basic Info */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  fullWidth
                  placeholder="e.g., Vitamin C Brightening Serum"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="URL Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  required
                  fullWidth
                  placeholder="vitamin-c-brightening-serum"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">/product/</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={4}
                  required
                  fullWidth
                  placeholder="Write a compelling product description..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="product-form-category-label">Category</InputLabel>
                  <Select
                    labelId="product-form-category-label"
                    id="product-form-category"
                    value={formData.categoryId}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {categories?.map((cat: any) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="product-form-brand-label">Brand</InputLabel>
                  <Select
                    labelId="product-form-brand-label"
                    id="product-form-brand"
                    value={formData.brandId}
                    label="Brand"
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {brands?.map((brand: any) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Product Badges
                </Typography>
                <Stack direction="row" spacing={3} flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Chip
                        label="New Arrival"
                        color={formData.isNew ? 'primary' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isBestSeller}
                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                        color="warning"
                      />
                    }
                    label={
                      <Chip
                        label="Best Seller"
                        color={formData.isBestSeller ? 'warning' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.moneyBackGuarantee}
                        onChange={(e) => setFormData({ ...formData, moneyBackGuarantee: e.target.checked })}
                        color="success"
                      />
                    }
                    label={
                      <Chip
                        label="Money-Back Guarantee"
                        color={formData.moneyBackGuarantee ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.eligibleForReturn}
                        onChange={(e) => setFormData({ ...formData, eligibleForReturn: e.target.checked })}
                        color={formData.eligibleForReturn ? 'success' : 'default'}
                      />
                    }
                    label={
                      <Chip
                        label={formData.eligibleForReturn ? 'Eligible for Returns' : 'Not Returnable'}
                        color={formData.eligibleForReturn ? 'success' : 'error'}
                        size="small"
                      />
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isAdult}
                        onChange={(e) => setFormData({ ...formData, isAdult: e.target.checked })}
                        color={formData.isAdult ? 'error' : 'default'}
                      />
                    }
                    label={
                      <Chip
                        label={formData.isAdult ? 'Pleasure Product' : 'Regular Product'}
                        color={formData.isAdult ? 'error' : 'default'}
                        size="small"
                      />
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Pricing & Variants */}
          <TabPanel value={activeTab} index={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add at least one variant with SKU, name, and price. You can add multiple sizes or options.
            </Alert>
            <Stack spacing={2}>
              {variants.map((variant, idx) => (
                <Paper key={idx} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Variant {idx + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        label="SKU"
                        placeholder="SKU-001"
                        value={variant.sku}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].sku = e.target.value.toUpperCase()
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Variant Name"
                        placeholder="30ml, 50ml, Large, etc."
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].name = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField
                        label="Price (₵)"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].price = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₵</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField
                        label="Discount (₵)"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        value={variant.discount}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[idx].discount = e.target.value
                          setVariants(newVariants)
                        }}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₵</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <TextField
                        label="Stock"
                        type="number"
                        inputProps={{ min: '0' }}
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
                    <Grid item xs={6} sm={12} md={1}>
                      <IconButton
                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                        disabled={variants.length <= 1}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                type="button"
                startIcon={<Add />}
                onClick={() => setVariants([...variants, { sku: '', name: '', price: '', discount: '0', stock: '0' }])}
                variant="outlined"
              >
                Add Variant
              </Button>
            </Stack>
          </TabPanel>

          {/* Tab 2: Images */}
          <TabPanel value={activeTab} index={2}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={addImageUrl}
                >
                  Add Image URL
                </Button>
              </Box>

              {images.length === 0 && (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    bgcolor: 'grey.50',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Drop images here or click to upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports JPG, PNG, WebP (max 5MB each)
                  </Typography>
                </Paper>
              )}

              <Grid container spacing={2}>
                {images.map((image, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card>
                      {image.uploading ? (
                        <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CircularProgress />
                        </Box>
                      ) : image.url ? (
                        <CardMedia
                          component="img"
                          height="180"
                          image={image.url}
                          alt={image.alt}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ p: 2 }}>
                          <TextField
                            label="Image URL"
                            value={image.url}
                            onChange={(e) => {
                              const newImages = [...images]
                              newImages[idx].url = e.target.value
                              setImages(newImages)
                            }}
                            fullWidth
                            size="small"
                            placeholder="https://..."
                          />
                        </Box>
                      )}
                      <CardContent sx={{ py: 1 }}>
                        <TextField
                          label="Alt Text"
                          value={image.alt}
                          onChange={(e) => {
                            const newImages = [...images]
                            newImages[idx].alt = e.target.value
                            setImages(newImages)
                          }}
                          fullWidth
                          size="small"
                          placeholder="Describe the image..."
                        />
                      </CardContent>
                      <CardActions>
                        {idx === 0 && <Chip label="Primary" size="small" color="primary" />}
                        <Box sx={{ flex: 1 }} />
                        <IconButton onClick={() => removeImage(idx)} color="error" size="small">
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </TabPanel>

          {/* Tab 3: Details */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Spa color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>How to Use</Typography>
                  </Stack>
                  <TextField
                    value={formData.howToUse}
                    onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Step 1: Apply a small amount to clean, dry skin...&#10;Step 2: Massage gently in circular motions...&#10;Step 3: Use morning and night for best results..."
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Science color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Ingredients</Typography>
                  </Stack>
                  <TextField
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Aqua, Glycerin, Niacinamide, Hyaluronic Acid, Vitamin C, Aloe Vera Extract..."
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <MonetizationOn color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Pricing & Packaging</Typography>
                  </Stack>
                  <TextField
                    value={formData.pricingPackaging}
                    onChange={(e) => setFormData({ ...formData, pricingPackaging: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Comes in a 30ml amber glass bottle with dropper. Each bottle provides approximately 60 applications..."
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <LocalShipping color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>Delivery & Returns</Typography>
                  </Stack>
                  <TextField
                    value={formData.deliveryReturns}
                    onChange={(e) => setFormData({ ...formData, deliveryReturns: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Free delivery in Accra. 1-3 business days delivery. Cash on delivery available. 30-day money-back guarantee..."
                  />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: FAQ */}
          <TabPanel value={activeTab} index={4}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add frequently asked questions about this product. These will appear on the product page.
            </Alert>
            <Stack spacing={2}>
              {faqs.map((faq, idx) => (
                <Paper key={idx} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" color="primary">
                          FAQ {idx + 1}
                        </Typography>
                        <IconButton
                          onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                          disabled={faqs.length <= 1}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Question"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[idx].question = e.target.value
                          setFaqs(newFaqs)
                        }}
                        fullWidth
                        size="small"
                        placeholder="e.g., How often should I use this product?"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Answer"
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[idx].answer = e.target.value
                          setFaqs(newFaqs)
                        }}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="For best results, use twice daily..."
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                type="button"
                startIcon={<Add />}
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                variant="outlined"
              >
                Add FAQ
              </Button>
            </Stack>
          </TabPanel>
        </Box>
      </DialogContent>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Stack direction="row" spacing={2}>
          {product && (
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              component="a"
              href={`/product/${product.slug}`}
              target="_blank"
            >
              Preview
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={isLoading}
            sx={{ minWidth: 140 }}
          >
            {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  )
}
