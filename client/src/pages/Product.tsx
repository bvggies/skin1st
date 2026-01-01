import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useCart from '../store/cart'
import { useAuth } from '../context/AuthContext'
import ImageGallery from '../components/ImageGallery'
import Tabs from '../components/Tabs'
import RelatedProducts from '../components/RelatedProducts'
import { ReviewsList, ReviewForm } from '../components/Reviews'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTrackProductView } from '../components/RecentlyViewed'
import RecentlyViewed from '../components/RecentlyViewed'

export default function Product(){
  const { slug } = useParams()
  const { data, isLoading } = useQuery(['product', slug], async ()=>{
    const res = await api.get(`/products/${slug}`)
    return res.data.product
  }, { enabled: !!slug })

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const cart = useCart()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Check if product is in wishlist
  const { data: wishlistData } = useQuery(['wishlist'], async () => {
    const res = await api.get('/wishlist')
    return res.data.items || []
  }, { enabled: !!user })

  const isInWishlist = wishlistData?.some((item: any) => item.productId === data?.id)

  const wishlistMutation = useMutation(
    () => isInWishlist 
      ? api.delete(`/wishlist/${data.id}`)
      : api.post('/wishlist', { productId: data.id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist'])
        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist')
      },
      onError: () => {
        toast.error('Failed to update wishlist')
      }
    }
  )

  // Track product view for recently viewed
  useTrackProductView(data?.id)

  if (isLoading || !data) return <div>Loading...</div>

  const addToCart = ()=>{
    const vId = selectedVariant || data.variants?.[0]?.id
    if (!vId) return
    cart.add({ variantId: vId, quantity: 1 })
  }

  const selectedVariantData = data.variants?.find((v: any) => v.id === selectedVariant) || data.variants?.[0]
  const finalPrice = selectedVariantData ? (selectedVariantData.price - (selectedVariantData.discount || 0)) / 100 : 0
  const originalPrice = selectedVariantData ? selectedVariantData.price / 100 : 0
  const hasDiscount = selectedVariantData && selectedVariantData.discount && selectedVariantData.discount > 0

  const tabs = [
    { id: 'desc', title: 'Description', content: (
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{data.description}</p>
        {data.category && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Category: </span>
            <span className="text-sm font-medium">{data.category.name}</span>
          </div>
        )}
      </div>
    ) },
    { id: 'pricing', title: 'Pricing', content: (
      <div className="space-y-3">
        {data.variants?.map((v:any)=> {
          const price = (v.price - (v.discount || 0)) / 100
          const original = v.price / 100
          const discount = v.discount || 0
          return (
            <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <div className="font-medium">{v.name}</div>
                <div className="text-sm text-gray-500">SKU: {v.sku} • Stock: {v.stock > 0 ? `${v.stock} available` : 'Out of stock'}</div>
              </div>
              <div className="text-right">
                {discount > 0 ? (
                  <div>
                    <div className="text-lg font-semibold text-indigo-600">₵{price.toFixed(2)}</div>
                    <div className="text-sm text-gray-400 line-through">₵{original.toFixed(2)}</div>
                    <div className="text-xs text-red-500">Save ₵{(discount / 100).toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-indigo-600">₵{price.toFixed(2)}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    ) },
    { id: 'packages', title: 'Packages & Pricing', content: (
      <div className="space-y-4">
        <p className="text-gray-700">Choose from our available package sizes to suit your needs:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.variants?.map((v: any) => {
            const price = (v.price - (v.discount || 0)) / 100
            return (
              <div key={v.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="font-semibold text-lg mb-2">{v.name}</div>
                <div className="text-2xl font-bold text-indigo-600 mb-2">₵{price.toFixed(2)}</div>
                {v.discount && v.discount > 0 && (
                  <div className="text-sm text-red-500 mb-2">Save ₵{(v.discount / 100).toFixed(2)}</div>
                )}
                <div className="text-sm text-gray-600">SKU: {v.sku}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {v.stock > 0 ? (
                    <span className="text-green-600">✓ In Stock ({v.stock} available)</span>
                  ) : (
                    <span className="text-red-600">✗ Out of Stock</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    ) },
    { id: 'howto', title: 'How to Use', content: (
      <div className="prose max-w-none">
        <h3 className="font-semibold mb-3">Usage Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Cleanse your skin thoroughly before application</li>
          <li>Apply a small amount to the affected area</li>
          <li>Gently massage in circular motions until absorbed</li>
          <li>Use twice daily (morning and evening) for best results</li>
          <li>Store in a cool, dry place away from direct sunlight</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800"><strong>Note:</strong> If you experience any irritation, discontinue use and consult a dermatologist.</p>
        </div>
      </div>
    ) },
    { id: 'ingredients', title: 'Ingredients', content: (
      <div className="prose max-w-none">
        <h3 className="font-semibold mb-3">Product Composition</h3>
        <p className="text-gray-700 mb-3">This product contains carefully selected ingredients for optimal skin care:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Natural botanical extracts</li>
          <li>Vitamin E for skin nourishment</li>
          <li>Hyaluronic acid for hydration</li>
          <li>Gentle, non-comedogenic formula</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800"><strong>Allergen Information:</strong> Please check the product label for a complete list of ingredients. If you have known allergies, consult with a healthcare professional before use.</p>
        </div>
      </div>
    ) },
    { id: 'faqs', title: 'FAQs', content: (
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="font-semibold mb-2">How long does shipping take?</h3>
          <p className="text-gray-700 text-sm">We deliver within 1-3 business days across Ghana. Delivery times may vary based on your location.</p>
        </div>
        <div className="border-b pb-3">
          <h3 className="font-semibold mb-2">Is this product suitable for all skin types?</h3>
          <p className="text-gray-700 text-sm">This product is formulated for most skin types. However, if you have sensitive skin or known allergies, we recommend doing a patch test first or consulting with a dermatologist.</p>
        </div>
        <div className="border-b pb-3">
          <h3 className="font-semibold mb-2">Can I return this product?</h3>
          <p className="text-gray-700 text-sm">Yes! We offer a money-back guarantee. If you're not satisfied with your purchase, you can return it within 30 days for a full refund.</p>
        </div>
        <div className="border-b pb-3">
          <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
          <p className="text-gray-700 text-sm">We accept Cash on Delivery (COD). You pay when you receive your order.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">How should I store this product?</h3>
          <p className="text-gray-700 text-sm">Store in a cool, dry place away from direct sunlight. Keep the cap tightly closed when not in use.</p>
        </div>
      </div>
    ) },
    { id: 'delivery', title: 'Delivery & Returns', content: (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Delivery Information</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Free delivery within 1-3 business days across Ghana</li>
            <li>Cash on Delivery (COD) available</li>
            <li>We'll contact you before delivery to confirm your address</li>
            <li>Delivery times may vary during holidays or peak seasons</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Returns Policy</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>30-day money-back guarantee</li>
            <li>Products must be unopened and in original packaging</li>
            <li>Contact us via WhatsApp or email to initiate a return</li>
            <li>Refunds will be processed within 5-7 business days</li>
          </ul>
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-200">
          <p className="text-sm text-green-800"><strong>Need Help?</strong> Contact us via WhatsApp at {process.env.REACT_APP_WHATSAPP_NUMBER} or email us for assistance with delivery or returns.</p>
        </div>
      </div>
    ) },
    { id: 'guarantee', title: 'Money-Back Guarantee', content: (
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="font-semibold text-indigo-900 mb-2">100% Satisfaction Guarantee</h3>
          <p className="text-indigo-800 text-sm">We stand behind the quality of our products. If you're not completely satisfied, we'll make it right.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">What's Covered</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Full refund within 30 days of purchase</li>
            <li>Products that don't meet your expectations</li>
            <li>Defective or damaged items</li>
            <li>Wrong items received</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">How to Claim</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
            <li>Contact us via WhatsApp or email within 30 days</li>
            <li>Provide your order number and reason for return</li>
            <li>We'll arrange for product return (if applicable)</li>
            <li>Receive your full refund within 5-7 business days</li>
          </ol>
        </div>
        {data.moneyBackGuarantee && (
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800"><strong>This product is covered by our Money-Back Guarantee!</strong></p>
          </div>
        )}
      </div>
    ) }
  ]

  const whatsappMessage = encodeURIComponent(`Hi, I'd like to order ${data.name} - Packages: ${data.variants?.map((v:any)=>v.name+'('+v.id+')').join(', ')}`)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <ImageGallery images={data.images || []} />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
          <div className="text-sm text-gray-500 mb-4">
            {data.brand?.name && <span>Brand: {data.brand.name}</span>}
            {data.category && <span className="ml-3">Category: {data.category.name}</span>}
          </div>
          
          {data.isNew && <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-1 rounded mb-2">New</span>}
          {data.isBestSeller && <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded ml-2 mb-2">Best Seller</span>}
          {data.moneyBackGuarantee && <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded ml-2 mb-2">Money-Back Guarantee</span>}

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Select Package</label>
            <select 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              value={selectedVariant||''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setSelectedVariant(e.target.value)}
            >
              {data.variants?.map((v:any)=>(
                <option key={v.id} value={v.id}>
                  {v.name} — ₵{(v.price/100).toFixed(2)}
                  {v.discount && v.discount > 0 && ` (Save ₵${(v.discount/100).toFixed(2)})`}
                  {v.stock <= 0 && ' — Out of Stock'}
                </option>
              ))}
            </select>
          </div>

          {selectedVariantData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-indigo-600">₵{finalPrice.toFixed(2)}</span>
                    <span className="text-lg text-gray-400 line-through">₵{originalPrice.toFixed(2)}</span>
                    <span className="text-sm text-red-600 font-medium">Save ₵{((selectedVariantData.discount || 0) / 100).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">₵{finalPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedVariantData.stock > 0 ? (
                  <span className="text-green-600">✓ In Stock ({selectedVariantData.stock} available)</span>
                ) : (
                  <span className="text-red-600">✗ Out of Stock</span>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button 
              onClick={addToCart} 
              disabled={!selectedVariantData || selectedVariantData.stock <= 0}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              Add to Cart
            </button>
            {user && (
              <button
                onClick={() => wishlistMutation.mutate()}
                className={`px-4 py-3 rounded-lg transition ${
                  isInWishlist
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            )}
            <a 
              href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${whatsappMessage}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium text-center"
            >
              Order via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Reviews</h2>
        <ReviewsList slug={slug as string} />
        <div className="mt-4">
          <h3 className="font-medium mb-2">Write a review</h3>
          <ReviewForm slug={slug as string} />
        </div>
      </div>

      <div className="mt-6">
        <RelatedProducts productId={data.id} categorySlug={data.category?.slug} />
      </div>

      <div className="mt-6">
        <RecentlyViewed />
      </div>
    </div>
  )
}
