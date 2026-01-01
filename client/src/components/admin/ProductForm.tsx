import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
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
    moneyBackGuarantee: false
  })

  const [variants, setVariants] = useState<Array<{
    sku: string
    name: string
    price: string
    discount: string
    stock: string
  }>>([{ sku: '', name: '', price: '', discount: '0', stock: '0' }])

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
        moneyBackGuarantee: product.moneyBackGuarantee || false
      })
      if (product.variants) {
        setVariants(product.variants.map((v: any) => ({
          sku: v.sku || '',
          name: v.name || '',
          price: String(v.price || 0),
          discount: String(v.discount || 0),
          stock: String(v.stock || 0)
        })))
      }
      if (product.images) {
        setImages(product.images.map((img: any) => ({
          url: img.url || '',
          alt: img.alt || ''
        })))
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
      }
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
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      categoryId: formData.categoryId || undefined,
      brandId: formData.brandId || undefined,
      variants: variants.filter(v => v.sku && v.name).map(v => ({
        sku: v.sku,
        name: v.name,
        price: parseInt(v.price) * 100, // Convert to cents
        discount: parseInt(v.discount) * 100,
        stock: parseInt(v.stock)
      })),
      images: images.filter(img => img.url).map(img => ({
        url: img.url,
        alt: img.alt || undefined
      }))
    }

    if (product) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{product ? 'Edit Product' : 'Create Product'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border p-2 rounded"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select category</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select brand</option>
                  {brands?.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="mr-2"
                />
                New Product
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="mr-2"
                />
                Best Seller
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.moneyBackGuarantee}
                  onChange={(e) => setFormData({ ...formData, moneyBackGuarantee: e.target.checked })}
                  className="mr-2"
                />
                Money-Back Guarantee
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Variants</label>
              {variants.map((variant, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[idx].sku = e.target.value
                      setVariants(newVariants)
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[idx].name = e.target.value
                      setVariants(newVariants)
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Price (₵)"
                    value={variant.price}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[idx].price = e.target.value
                      setVariants(newVariants)
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Discount (₵)"
                    value={variant.discount}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[idx].discount = e.target.value
                      setVariants(newVariants)
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[idx].stock = e.target.value
                      setVariants(newVariants)
                    }}
                    className="border p-2 rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setVariants([...variants, { sku: '', name: '', price: '', discount: '0', stock: '0' }])}
                className="text-sm text-indigo-600"
              >
                + Add Variant
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images</label>
              {images.map((image, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={image.url}
                    onChange={(e) => {
                      const newImages = [...images]
                      newImages[idx].url = e.target.value
                      setImages(newImages)
                    }}
                    className="flex-1 border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={image.alt}
                    onChange={(e) => {
                      const newImages = [...images]
                      newImages[idx].alt = e.target.value
                      setImages(newImages)
                    }}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setImages([...images, { url: '', alt: '' }])}
                className="text-sm text-indigo-600"
              >
                + Add Image
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

