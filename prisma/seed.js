require('dotenv').config({ path: '../.env' })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding beauty/skincare categories, brands, and products...')

  // Create Categories
  const faceCategory = await prisma.category.upsert({
    where: { slug: 'face-care' },
    update: {},
    create: { name: 'Face Care', slug: 'face-care' }
  })

  const bodyCategory = await prisma.category.upsert({
    where: { slug: 'body-oils' },
    update: {},
    create: { name: 'Body Oils', slug: 'body-oils' }
  })

  const serumsCategory = await prisma.category.upsert({
    where: { slug: 'serums' },
    update: {},
    create: { name: 'Serums', slug: 'serums' }
  })

  const moisturizersCategory = await prisma.category.upsert({
    where: { slug: 'moisturizers' },
    update: {},
    create: { name: 'Moisturizers', slug: 'moisturizers' }
  })

  const cleansersCategory = await prisma.category.upsert({
    where: { slug: 'cleansers' },
    update: {},
    create: { name: 'Cleansers', slug: 'cleansers' }
  })

  const treatmentsCategory = await prisma.category.upsert({
    where: { slug: 'treatments' },
    update: {},
    create: { name: 'Treatments', slug: 'treatments' }
  })

  // Create Brands
  const skin1stBrand = await prisma.brand.upsert({
    where: { slug: 'skin1st' },
    update: {},
    create: { name: 'Skin1st', slug: 'skin1st' }
  })

  const pureBeautyBrand = await prisma.brand.upsert({
    where: { slug: 'pure-beauty' },
    update: {},
    create: { name: 'Pure Beauty', slug: 'pure-beauty' }
  })

  const naturalGlowBrand = await prisma.brand.upsert({
    where: { slug: 'natural-glow' },
    update: {},
    create: { name: 'Natural Glow', slug: 'natural-glow' }
  })

  const eliteSkincBrand = await prisma.brand.upsert({
    where: { slug: 'elite-skincare' },
    update: {},
    create: { name: 'Elite Skincare', slug: 'elite-skincare' }
  })

  // Create Products
  const products = [
    {
      name: 'Vitamin C Brightening Serum',
      slug: 'vitamin-c-brightening-serum',
      description: 'A powerful Vitamin C serum that brightens skin, reduces dark spots, and evens out skin tone. Formulated with 15% L-Ascorbic Acid and Hyaluronic Acid for maximum effectiveness.',
      categoryId: serumsCategory.id,
      brandId: skin1stBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p>Apply 3-4 drops to clean, dry skin in the morning. Gently pat onto face and neck, avoiding the eye area. Follow with moisturizer and sunscreen.</p>',
      ingredients: '<p>Water, L-Ascorbic Acid (15%), Hyaluronic Acid, Vitamin E, Ferulic Acid, Glycerin, Aloe Vera Extract</p>',
      variants: [
        { sku: 'VCS-30ML', name: '30ml Bottle', price: 4500, discount: 500, stock: 50 },
        { sku: 'VCS-50ML', name: '50ml Bottle', price: 7000, discount: 1000, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', alt: 'Vitamin C Brightening Serum' }]
    },
    {
      name: 'Hydrating Rose Face Oil',
      slug: 'hydrating-rose-face-oil',
      description: 'A luxurious facial oil infused with pure rose extract and rosehip oil. Deeply hydrates and nourishes skin while providing a radiant glow.',
      categoryId: bodyCategory.id,
      brandId: pureBeautyBrand.id,
      isNew: true,
      isBestSeller: false,
      howToUse: '<p>Apply 4-5 drops to fingertips and gently massage onto face after cleansing. Can be used alone or mixed with moisturizer.</p>',
      ingredients: '<p>Rosehip Seed Oil, Jojoba Oil, Rose Extract, Vitamin E, Evening Primrose Oil</p>',
      variants: [
        { sku: 'HRFO-30ML', name: '30ml Bottle', price: 3500, stock: 45 },
        { sku: 'HRFO-50ML', name: '50ml Bottle', price: 5500, discount: 500, stock: 25 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600', alt: 'Hydrating Rose Face Oil' }]
    },
    {
      name: 'Anti-Aging Night Cream',
      slug: 'anti-aging-night-cream',
      description: 'An intensive night cream with retinol and peptides that works while you sleep to reduce fine lines, wrinkles, and improve skin elasticity.',
      categoryId: moisturizersCategory.id,
      brandId: skin1stBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p>Apply a generous amount to clean face and neck every evening. Gently massage in upward motions until fully absorbed.</p>',
      ingredients: '<p>Retinol, Peptide Complex, Shea Butter, Hyaluronic Acid, Niacinamide, Vitamin E</p>',
      variants: [
        { sku: 'AANC-50G', name: '50g Jar', price: 5500, discount: 1000, stock: 35 },
        { sku: 'AANC-100G', name: '100g Jar', price: 9500, discount: 1500, stock: 20 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600', alt: 'Anti-Aging Night Cream' }]
    },
    {
      name: 'Gentle Foaming Cleanser',
      slug: 'gentle-foaming-cleanser',
      description: 'A gentle, pH-balanced foaming cleanser that effectively removes makeup, dirt, and impurities without stripping the skin of its natural oils.',
      categoryId: cleansersCategory.id,
      brandId: naturalGlowBrand.id,
      isNew: false,
      isBestSeller: false,
      howToUse: '<p>Wet face with lukewarm water. Pump foam into hands and massage onto face in circular motions. Rinse thoroughly and pat dry.</p>',
      ingredients: '<p>Coconut-derived Surfactants, Aloe Vera, Green Tea Extract, Chamomile, Glycerin</p>',
      variants: [
        { sku: 'GFC-150ML', name: '150ml Bottle', price: 2800, stock: 60 },
        { sku: 'GFC-300ML', name: '300ml Bottle', price: 4800, discount: 500, stock: 40 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', alt: 'Gentle Foaming Cleanser' }]
    },
    {
      name: 'Hyaluronic Acid Moisturizer',
      slug: 'hyaluronic-acid-moisturizer',
      description: 'A lightweight, oil-free moisturizer with 3 types of Hyaluronic Acid for deep, long-lasting hydration. Perfect for all skin types.',
      categoryId: moisturizersCategory.id,
      brandId: skin1stBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p>Apply to face and neck morning and evening after cleansing and toning. Gently pat until absorbed.</p>',
      ingredients: '<p>Hyaluronic Acid (3 types), Ceramides, Squalane, Aloe Vera, Vitamin B5</p>',
      variants: [
        { sku: 'HAM-50ML', name: '50ml Bottle', price: 4200, discount: 700, stock: 55 },
        { sku: 'HAM-100ML', name: '100ml Bottle', price: 7500, discount: 1000, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600', alt: 'Hyaluronic Acid Moisturizer' }]
    },
    {
      name: 'Tea Tree Spot Treatment',
      slug: 'tea-tree-spot-treatment',
      description: 'A fast-acting spot treatment with pure tea tree oil and salicylic acid that targets blemishes and reduces inflammation overnight.',
      categoryId: treatmentsCategory.id,
      brandId: pureBeautyBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p>Apply a small amount directly onto blemishes before bed. Leave on overnight. Use 2-3 times per week or as needed.</p>',
      ingredients: '<p>Tea Tree Oil, Salicylic Acid (2%), Niacinamide, Zinc, Aloe Vera</p>',
      variants: [
        { sku: 'TTST-15ML', name: '15ml Tube', price: 1800, stock: 80 },
        { sku: 'TTST-30ML', name: '30ml Tube', price: 3200, discount: 400, stock: 50 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600', alt: 'Tea Tree Spot Treatment' }]
    },
    {
      name: 'Collagen Boost Eye Cream',
      slug: 'collagen-boost-eye-cream',
      description: 'An advanced eye cream with marine collagen and caffeine that reduces puffiness, dark circles, and fine lines around the delicate eye area.',
      categoryId: faceCategory.id,
      brandId: skin1stBrand.id,
      isNew: true,
      isBestSeller: false,
      howToUse: '<p>Gently dab a small amount around the eye area using your ring finger. Use morning and evening after serum.</p>',
      ingredients: '<p>Marine Collagen, Caffeine, Vitamin K, Peptides, Hyaluronic Acid, Cucumber Extract</p>',
      variants: [
        { sku: 'CBEC-15ML', name: '15ml Jar', price: 3200, discount: 400, stock: 40 },
        { sku: 'CBEC-30ML', name: '30ml Jar', price: 5800, discount: 800, stock: 25 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600', alt: 'Collagen Boost Eye Cream' }]
    },
    {
      name: 'Niacinamide Pore Minimizer',
      slug: 'niacinamide-pore-minimizer',
      description: 'A concentrated serum with 10% Niacinamide that minimizes pores, controls oil production, and improves skin texture for a smoother complexion.',
      categoryId: serumsCategory.id,
      brandId: naturalGlowBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p>Apply a few drops to clean skin before moisturizer. Can be used morning and evening. Pairs well with Hyaluronic Acid.</p>',
      ingredients: '<p>Niacinamide (10%), Zinc PCA, Hyaluronic Acid, Panthenol, Licorice Root Extract</p>',
      variants: [
        { sku: 'NPM-30ML', name: '30ml Bottle', price: 3800, stock: 65 },
        { sku: 'NPM-60ML', name: '60ml Bottle', price: 6800, discount: 1000, stock: 35 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600', alt: 'Niacinamide Pore Minimizer' }]
    },
    {
      name: 'Shea Butter Body Lotion',
      slug: 'shea-butter-body-lotion',
      description: 'A rich, nourishing body lotion with African Shea Butter and coconut oil that deeply moisturizes and softens dry skin.',
      categoryId: bodyCategory.id,
      brandId: naturalGlowBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p>Apply generously to body after bathing while skin is still slightly damp. Massage until fully absorbed.</p>',
      ingredients: '<p>Shea Butter, Coconut Oil, Vitamin E, Cocoa Butter, Aloe Vera, Sweet Almond Oil</p>',
      variants: [
        { sku: 'SBBL-200ML', name: '200ml Bottle', price: 2500, stock: 70 },
        { sku: 'SBBL-400ML', name: '400ml Bottle', price: 4200, discount: 500, stock: 45 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600', alt: 'Shea Butter Body Lotion' }]
    },
    {
      name: 'Exfoliating Face Scrub',
      slug: 'exfoliating-face-scrub',
      description: 'A gentle exfoliating scrub with natural walnut shell powder and papaya enzymes that removes dead skin cells and reveals brighter, smoother skin.',
      categoryId: cleansersCategory.id,
      brandId: eliteSkincBrand.id,
      isNew: false,
      isBestSeller: false,
      howToUse: '<p>Use 2-3 times per week on damp skin. Massage gently in circular motions, avoiding eye area. Rinse with lukewarm water.</p>',
      ingredients: '<p>Walnut Shell Powder, Papaya Enzyme, Glycerin, Aloe Vera, Vitamin E, Jojoba Oil</p>',
      variants: [
        { sku: 'EFS-100ML', name: '100ml Tube', price: 2200, stock: 55 },
        { sku: 'EFS-200ML', name: '200ml Tube', price: 3800, discount: 400, stock: 35 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', alt: 'Exfoliating Face Scrub' }]
    },
    {
      name: 'Sunscreen SPF 50+',
      slug: 'sunscreen-spf-50',
      description: 'A lightweight, non-greasy sunscreen with SPF 50+ broad-spectrum protection. Water-resistant and suitable for all skin types.',
      categoryId: faceCategory.id,
      brandId: skin1stBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p>Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating.</p>',
      ingredients: '<p>Zinc Oxide, Titanium Dioxide, Vitamin E, Aloe Vera, Green Tea Extract, Niacinamide</p>',
      variants: [
        { sku: 'SS50-50ML', name: '50ml Tube', price: 3500, discount: 500, stock: 60 },
        { sku: 'SS50-100ML', name: '100ml Tube', price: 6000, discount: 800, stock: 40 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600', alt: 'Sunscreen SPF 50+' }]
    },
    {
      name: 'Retinol Anti-Wrinkle Serum',
      slug: 'retinol-anti-wrinkle-serum',
      description: 'A potent anti-aging serum with encapsulated retinol that reduces wrinkles, improves skin texture, and promotes cell turnover.',
      categoryId: serumsCategory.id,
      brandId: eliteSkincBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p>Apply a few drops to clean skin every evening. Start with 2-3 times per week, gradually increasing frequency. Always use sunscreen during the day.</p>',
      ingredients: '<p>Encapsulated Retinol (0.5%), Squalane, Vitamin E, Hyaluronic Acid, Bakuchiol</p>',
      variants: [
        { sku: 'RAWS-30ML', name: '30ml Bottle', price: 5500, discount: 800, stock: 35 },
        { sku: 'RAWS-50ML', name: '50ml Bottle', price: 8500, discount: 1500, stock: 20 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', alt: 'Retinol Anti-Wrinkle Serum' }]
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
          updatedAt: new Date(),
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

    // Create images
    for (const imageData of images) {
      await prisma.productImage.create({
        data: {
          ...imageData,
          productId: product.id
        }
      })
    }
  }

  // Create demo admin user
  const adminPassword = await bcrypt.hash('AdminPass123!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@skin1st.com' },
    update: {},
    create: {
      email: 'admin@skin1st.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  })

  // Create demo customer user
  const customerPassword = await bcrypt.hash('CustomerPass123!', 10)
  await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: customerPassword,
      name: 'Jane Customer',
      role: 'CUSTOMER'
    }
  })

  console.log(`✅ Seeding completed!`)
  console.log(`📦 Created ${products.length} beauty products`)
  console.log(`🏷️ Created 6 categories: Face Care, Body Oils, Serums, Moisturizers, Cleansers, Treatments`)
  console.log(`🏢 Created 4 brands: Skin1st, Pure Beauty, Natural Glow, Elite Skincare`)
  console.log(``)
  console.log(`👤 Admin Login:`)
  console.log(`   Email: admin@skin1st.com`)
  console.log(`   Password: AdminPass123!`)
  console.log(``)
  console.log(`👤 Customer Login:`)
  console.log(`   Email: customer@test.com`)
  console.log(`   Password: CustomerPass123!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
