require('dotenv').config({ path: '../.env' })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding sample categories, brands, products...')

  // Create Categories
  const engineOilCategory = await prisma.category.upsert({
    where: { slug: 'engine-oil' },
    update: {},
    create: { name: 'Engine Oils', slug: 'engine-oil' }
  })

  const motorOilCategory = await prisma.category.upsert({
    where: { slug: 'motor-oil' },
    update: {},
    create: { name: 'Motor Oils', slug: 'motor-oil' }
  })

  const gearOilCategory = await prisma.category.upsert({
    where: { slug: 'gear-oil' },
    update: {},
    create: { name: 'Gear Oils', slug: 'gear-oil' }
  })

  const transmissionOilCategory = await prisma.category.upsert({
    where: { slug: 'transmission-oil' },
    update: {},
    create: { name: 'Transmission Oils', slug: 'transmission-oil' }
  })

  const hydraulicOilCategory = await prisma.category.upsert({
    where: { slug: 'hydraulic-oil' },
    update: {},
    create: { name: 'Hydraulic Oils', slug: 'hydraulic-oil' }
  })

  const cookingOilCategory = await prisma.category.upsert({
    where: { slug: 'cooking-oil' },
    update: {},
    create: { name: 'Cooking Oils', slug: 'cooking-oil' }
  })

  // Create Brands
  const pureOilBrand = await prisma.brand.upsert({
    where: { slug: 'pure-oil' },
    update: {},
    create: { name: 'Pure Oil Co', slug: 'pure-oil' }
  })

  const premiumOilBrand = await prisma.brand.upsert({
    where: { slug: 'premium-oil' },
    update: {},
    create: { name: 'Premium Oil', slug: 'premium-oil' }
  })

  const eliteOilBrand = await prisma.brand.upsert({
    where: { slug: 'elite-oil' },
    update: {},
    create: { name: 'Elite Oil', slug: 'elite-oil' }
  })

  const naturalOilBrand = await prisma.brand.upsert({
    where: { slug: 'natural-oil' },
    update: {},
    create: { name: 'Natural Oil', slug: 'natural-oil' }
  })

  // Create Products - Engine Oils
  const products = [
    {
      name: 'Ultra Premium Engine Oil 5W-30',
      slug: 'ultra-premium-engine-oil-5w30',
      description: 'Premium synthetic engine oil for modern engines. Provides excellent protection and performance.',
      categoryId: engineOilCategory.id,
      brandId: pureOilBrand.id,
      isNew: true,
      isBestSeller: true,
      variants: [
        { sku: 'UO-5W30-1L', name: '1L Bottle', price: 8500, discount: 500, stock: 50 },
        { sku: 'UO-5W30-4L', name: '4L Jug', price: 30000, discount: 2000, stock: 20 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Ultra Premium 5W-30' }]
    },
    {
      name: 'Synthetic Motor Oil 10W-40',
      slug: 'synthetic-motor-oil-10w40',
      description: 'High-performance synthetic motor oil for all-season use. Excellent for high-mileage vehicles.',
      categoryId: motorOilCategory.id,
      brandId: premiumOilBrand.id,
      isNew: true,
      isBestSeller: false,
      variants: [
        { sku: 'SMO-10W40-1L', name: '1L Bottle', price: 7500, stock: 45 },
        { sku: 'SMO-10W40-5L', name: '5L Container', price: 35000, discount: 3000, stock: 15 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Synthetic Motor Oil 10W-40' }]
    },
    {
      name: 'Heavy Duty Gear Oil 80W-90',
      slug: 'heavy-duty-gear-oil-80w90',
      description: 'Heavy-duty gear oil for manual transmissions and differentials. Provides superior protection.',
      categoryId: gearOilCategory.id,
      brandId: eliteOilBrand.id,
      isNew: false,
      isBestSeller: true,
      variants: [
        { sku: 'HDGO-80W90-1L', name: '1L Bottle', price: 9000, stock: 30 },
        { sku: 'HDGO-80W90-4L', name: '4L Jug', price: 32000, discount: 2000, stock: 12 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Heavy Duty Gear Oil' }]
    },
    {
      name: 'Automatic Transmission Fluid',
      slug: 'automatic-transmission-fluid',
      description: 'Premium ATF for smooth shifting and extended transmission life. Compatible with most vehicles.',
      categoryId: transmissionOilCategory.id,
      brandId: pureOilBrand.id,
      isNew: true,
      isBestSeller: false,
      variants: [
        { sku: 'ATF-1L', name: '1L Bottle', price: 12000, discount: 1000, stock: 40 },
        { sku: 'ATF-4L', name: '4L Container', price: 45000, discount: 5000, stock: 18 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Automatic Transmission Fluid' }]
    },
    {
      name: 'Hydraulic Oil ISO 46',
      slug: 'hydraulic-oil-iso46',
      description: 'High-quality hydraulic oil for industrial machinery and equipment. Excellent thermal stability.',
      categoryId: hydraulicOilCategory.id,
      brandId: premiumOilBrand.id,
      isNew: false,
      isBestSeller: true,
      variants: [
        { sku: 'HO-ISO46-5L', name: '5L Container', price: 28000, stock: 25 },
        { sku: 'HO-ISO46-20L', name: '20L Drum', price: 100000, discount: 10000, stock: 8 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Hydraulic Oil ISO 46' }]
    },
    {
      name: 'Premium Cooking Oil - Sunflower',
      slug: 'premium-cooking-oil-sunflower',
      description: '100% pure sunflower oil. Rich in vitamin E, perfect for cooking and frying.',
      categoryId: cookingOilCategory.id,
      brandId: naturalOilBrand.id,
      isNew: true,
      isBestSeller: false,
      variants: [
        { sku: 'CO-SF-500ML', name: '500ml Bottle', price: 1500, stock: 100 },
        { sku: 'CO-SF-1L', name: '1L Bottle', price: 2800, discount: 300, stock: 80 },
        { sku: 'CO-SF-5L', name: '5L Container', price: 12000, discount: 2000, stock: 40 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', alt: 'Premium Sunflower Oil' }]
    },
    {
      name: 'Extra Virgin Olive Oil',
      slug: 'extra-virgin-olive-oil',
      description: 'Cold-pressed extra virgin olive oil. Premium quality for salads and cooking.',
      categoryId: cookingOilCategory.id,
      brandId: naturalOilBrand.id,
      isNew: true,
      isBestSeller: true,
      variants: [
        { sku: 'EVOO-250ML', name: '250ml Bottle', price: 3500, discount: 500, stock: 60 },
        { sku: 'EVOO-500ML', name: '500ml Bottle', price: 6500, discount: 1000, stock: 50 },
        { sku: 'EVOO-1L', name: '1L Bottle', price: 12000, discount: 2000, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', alt: 'Extra Virgin Olive Oil' }]
    },
    {
      name: 'Premium Engine Oil 0W-20',
      slug: 'premium-engine-oil-0w20',
      description: 'Full synthetic engine oil for modern fuel-efficient engines. Low viscosity for better fuel economy.',
      categoryId: engineOilCategory.id,
      brandId: premiumOilBrand.id,
      isNew: true,
      isBestSeller: false,
      variants: [
        { sku: 'PEO-0W20-1L', name: '1L Bottle', price: 9500, discount: 1000, stock: 35 },
        { sku: 'PEO-0W20-5L', name: '5L Container', price: 42000, discount: 5000, stock: 15 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Premium Engine Oil 0W-20' }]
    },
    {
      name: 'Coconut Cooking Oil',
      slug: 'coconut-cooking-oil',
      description: 'Pure organic coconut oil. Great for cooking, baking, and skincare. Rich in healthy fats.',
      categoryId: cookingOilCategory.id,
      brandId: naturalOilBrand.id,
      isNew: false,
      isBestSeller: true,
      variants: [
        { sku: 'CCO-500ML', name: '500ml Jar', price: 3200, stock: 70 },
        { sku: 'CCO-1L', name: '1L Jar', price: 6000, discount: 800, stock: 55 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', alt: 'Coconut Cooking Oil' }]
    },
    {
      name: 'Diesel Engine Oil 15W-40',
      slug: 'diesel-engine-oil-15w40',
      description: 'Heavy-duty diesel engine oil for trucks and commercial vehicles. Superior protection.',
      categoryId: engineOilCategory.id,
      brandId: eliteOilBrand.id,
      isNew: false,
      isBestSeller: true,
      variants: [
        { sku: 'DEO-15W40-4L', name: '4L Jug', price: 28000, discount: 3000, stock: 20 },
        { sku: 'DEO-15W40-20L', name: '20L Drum', price: 130000, discount: 15000, stock: 5 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', alt: 'Diesel Engine Oil 15W-40' }]
    }
  ]

  // Create products
  for (const productData of products) {
    const { variants, images, ...productInfo } = productData
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productInfo.slug },
      include: { variants: true, images: true }
    })

    let product
    if (existingProduct) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: existingProduct.id }
      })

      // Update product
      product = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          ...productInfo,
          updatedAt: new Date(), // Update timestamp to make it appear first
        }
      })
    } else {
      // Create new product
      product = await prisma.product.create({
        data: productInfo
      })
    }

    // Upsert variants (create or update by SKU)
    for (const variantData of variants) {
      await prisma.variant.upsert({
        where: { sku: variantData.sku },
        update: {
          name: variantData.name,
          price: variantData.price,
          discount: variantData.discount || 0,
          stock: variantData.stock || 0,
          productId: product.id
        },
        create: {
          ...variantData,
          discount: variantData.discount || 0,
          productId: product.id
        }
      })
    }

    // Create images (delete old ones first if updating)
    if (existingProduct) {
      await prisma.productImage.deleteMany({
        where: { productId: product.id }
      })
    }
    
    for (const imageData of images) {
      await prisma.productImage.create({
        data: {
          ...imageData,
          productId: product.id
        }
      })
    }
  }

  // Create demo admin and customer users
  const adminPassword = await bcrypt.hash('AdminPass123!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@skin1st.test' },
    update: {},
    create: {
      email: 'admin@skin1st.test',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  })

  const customerPassword = await bcrypt.hash('CustomerPass123!', 10)
  await prisma.user.upsert({
    where: { email: 'jane@doe.test' },
    update: {},
    create: {
      email: 'jane@doe.test',
      password: customerPassword,
      name: 'Jane Doe',
      role: 'CUSTOMER'
    }
  })

  console.log(`✅ Seeding completed! Created ${products.length} products.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
