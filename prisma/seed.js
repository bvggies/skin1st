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

  const sunscreenCategory = await prisma.category.upsert({
    where: { slug: 'sunscreen' },
    update: {},
    create: { name: 'Sunscreen', slug: 'sunscreen' }
  })

  const soapCategory = await prisma.category.upsert({
    where: { slug: 'soaps' },
    update: {},
    create: { name: 'Soaps & Cleansing Bars', slug: 'soaps' }
  })

  // Create Brands
  const skin1stBrand = await prisma.brand.upsert({
    where: { slug: 'skin1st' },
    update: {},
    create: { name: 'Skin1st', slug: 'skin1st' }
  })

  const mooyamBrand = await prisma.brand.upsert({
    where: { slug: 'mooyam' },
    update: {},
    create: { name: 'Mooyam', slug: 'mooyam' }
  })

  const nidaBrand = await prisma.brand.upsert({
    where: { slug: 'nida' },
    update: {},
    create: { name: 'NIDA', slug: 'nida' }
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

  // Create Products - Including the requested products
  const products = [
    // REQUESTED PRODUCTS
    {
      name: 'Mooyam Sunscreen SPF 50+',
      slug: 'mooyam-sunscreen-spf50',
      description: 'A lightweight, non-greasy sunscreen that provides broad-spectrum protection against harmful UVA and UVB rays. Enriched with moisturizing agents to keep the skin hydrated while preventing sun damage. Perfect for daily use under makeup or on its own. Water-resistant formula suitable for all skin types.',
      categoryId: sunscreenCategory.id,
      brandId: mooyamBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p><strong>How to Apply:</strong></p><ol><li>Apply generously 15-20 minutes before sun exposure</li><li>Spread evenly on face and exposed areas</li><li>Reapply every 2 hours, especially after swimming or sweating</li><li>For best results, use as the last step in your morning skincare routine before makeup</li></ol>',
      ingredients: '<p><strong>Active Ingredients:</strong> Zinc Oxide, Titanium Dioxide</p><p><strong>Other Ingredients:</strong> Water, Cyclopentasiloxane, Glycerin, Hyaluronic Acid, Vitamin E (Tocopherol), Aloe Barbadensis Leaf Extract, Niacinamide, Centella Asiatica Extract</p>',
      variants: [
        { sku: 'MOOYAM-SS-50ML', name: '50ml Tube', price: 4500, discount: 500, stock: 45 },
        { sku: 'MOOYAM-SS-100ML', name: '100ml Tube', price: 7500, discount: 1000, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=600', alt: 'Mooyam Sunscreen SPF 50+' }]
    },
    {
      name: 'Mooyam Niacinamide 10% Serum',
      slug: 'mooyam-niacinamide-10-serum',
      description: 'A powerful serum formulated with 10% Niacinamide (Vitamin B3) to reduce the appearance of dark spots, minimize pores, and improve overall skin texture. This potent formula helps control excess oil production, reduces redness, and strengthens the skin barrier. Suitable for all skin types including sensitive skin.',
      categoryId: serumsCategory.id,
      brandId: mooyamBrand.id,
      isNew: true,
      isBestSeller: true,
      howToUse: '<p><strong>How to Use:</strong></p><ol><li>After cleansing and toning, apply 3-4 drops to your palm</li><li>Gently pat onto face, avoiding the eye area</li><li>Follow with moisturizer</li><li>Use morning and evening for best results</li><li>Can be layered with other serums like Hyaluronic Acid</li></ol><p><strong>Tip:</strong> Start with once daily application if you have sensitive skin</p>',
      ingredients: '<p><strong>Key Active:</strong> Niacinamide (10%)</p><p><strong>Supporting Ingredients:</strong> Water, Hyaluronic Acid, Zinc PCA, Panthenol (Vitamin B5), Allantoin, Centella Asiatica Extract, Licorice Root Extract, Glycerin</p>',
      variants: [
        { sku: 'MOOYAM-NIA-30ML', name: '30ml Bottle', price: 3800, discount: 400, stock: 55 },
        { sku: 'MOOYAM-NIA-60ML', name: '60ml Bottle', price: 6500, discount: 800, stock: 35 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', alt: 'Mooyam Niacinamide 10% Serum' }]
    },
    {
      name: 'Lemon Turmeric Brightening Soap',
      slug: 'lemon-turmeric-brightening-soap',
      description: 'A natural handcrafted soap bar infused with pure lemon extract and turmeric powder, known for their powerful brightening and anti-inflammatory properties. This soap gently cleanses, exfoliates dead skin cells, and helps fade dark spots and hyperpigmentation. The combination of lemon and turmeric provides antibacterial benefits while leaving skin feeling fresh and rejuvenated.',
      categoryId: soapCategory.id,
      brandId: naturalGlowBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p><strong>How to Use:</strong></p><ol><li>Wet your face and body with warm water</li><li>Lather the soap between your hands or with a washcloth</li><li>Massage gently onto skin in circular motions</li><li>Leave on for 1-2 minutes to allow active ingredients to work</li><li>Rinse thoroughly with lukewarm water</li><li>Pat dry and follow with moisturizer</li></ol><p><strong>Note:</strong> Use sunscreen during the day as lemon can increase sun sensitivity</p>',
      ingredients: '<p><strong>Natural Ingredients:</strong> Saponified Coconut Oil, Palm Oil, Shea Butter, Lemon Extract, Turmeric Powder (Curcuma Longa), Vitamin E, Glycerin, Lemon Essential Oil, Honey</p>',
      variants: [
        { sku: 'LTS-100G', name: '100g Bar', price: 1500, stock: 80 },
        { sku: 'LTS-200G', name: '200g Bar', price: 2500, discount: 300, stock: 50 },
        { sku: 'LTS-3PACK', name: '3-Pack (100g each)', price: 4000, discount: 500, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600', alt: 'Lemon Turmeric Brightening Soap' }]
    },
    {
      name: 'Collagen Boost Eye Cream',
      slug: 'collagen-boost-eye-cream',
      description: 'An advanced anti-aging eye cream enriched with marine collagen, peptides, and caffeine to reduce the appearance of fine lines, wrinkles, dark circles, and puffiness around the delicate eye area. The lightweight formula absorbs quickly and provides deep hydration while improving skin elasticity. Perfect for all ages looking to maintain youthful, bright eyes.',
      categoryId: faceCategory.id,
      brandId: skin1stBrand.id,
      isNew: true,
      isBestSeller: false,
      howToUse: '<p><strong>How to Apply:</strong></p><ol><li>Use morning and evening after cleansing</li><li>Take a small amount (rice grain size) on your ring finger</li><li>Gently dab around the eye area, starting from the inner corner</li><li>Pat gently until fully absorbed - do not rub or tug</li><li>Can be used under makeup</li></ol><p><strong>Pro Tip:</strong> Store in the refrigerator for extra de-puffing benefits</p>',
      ingredients: '<p><strong>Key Actives:</strong> Marine Collagen, Caffeine, Retinyl Palmitate, Peptide Complex</p><p><strong>Supporting Ingredients:</strong> Hyaluronic Acid, Vitamin K, Cucumber Extract, Vitamin E, Squalane, Aloe Vera, Green Tea Extract</p>',
      variants: [
        { sku: 'CBEC-15ML', name: '15ml Jar', price: 3500, discount: 500, stock: 40 },
        { sku: 'CBEC-30ML', name: '30ml Jar', price: 6000, discount: 800, stock: 25 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600', alt: 'Collagen Boost Eye Cream' }]
    },
    {
      name: 'NIDA Brightening & Moisturizing Cream',
      slug: 'nida-brightening-cream',
      description: 'A nourishing multi-purpose cream designed to hydrate, brighten, and even out skin tone. NIDA Cream is formulated with natural extracts and vitamins to improve skin texture, reduce dark spots, and provide long-lasting moisture. This lightweight, non-greasy formula is perfect for daily use and suitable for all skin types. Popular across Ghana and West Africa for its effective brightening properties.',
      categoryId: moisturizersCategory.id,
      brandId: nidaBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p><strong>How to Use:</strong></p><ol><li>Cleanse face thoroughly and pat dry</li><li>Apply a generous amount to face and neck</li><li>Massage gently in upward circular motions until absorbed</li><li>Use twice daily - morning and evening</li><li>For best results, use consistently for 4-6 weeks</li></ol><p><strong>Tip:</strong> Can also be used on elbows, knees, and other areas with uneven skin tone</p>',
      ingredients: '<p><strong>Key Ingredients:</strong> Niacinamide, Vitamin C (Ascorbic Acid), Alpha Arbutin, Kojic Acid, Shea Butter, Aloe Vera Extract</p><p><strong>Other Ingredients:</strong> Water, Glycerin, Jojoba Oil, Vitamin E, Licorice Root Extract, Mulberry Extract</p>',
      variants: [
        { sku: 'NIDA-50G', name: '50g Jar', price: 2800, stock: 60 },
        { sku: 'NIDA-100G', name: '100g Jar', price: 4800, discount: 600, stock: 40 },
        { sku: 'NIDA-200G', name: '200g Jar', price: 8500, discount: 1000, stock: 25 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600', alt: 'NIDA Brightening Cream' }]
    },

    // ADDITIONAL POPULAR PRODUCTS
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
    },
    {
      name: 'Mooyam Turmeric Face Cream',
      slug: 'mooyam-turmeric-face-cream',
      description: 'A powerful brightening cream infused with turmeric extract known for its anti-inflammatory and skin-evening properties. Helps reduce dark spots, acne scars, and uneven skin tone while providing deep hydration.',
      categoryId: faceCategory.id,
      brandId: mooyamBrand.id,
      isNew: true,
      isBestSeller: false,
      howToUse: '<p><strong>How to Use:</strong></p><ol><li>Cleanse face thoroughly</li><li>Apply a small amount to face and neck</li><li>Massage gently until absorbed</li><li>Use morning and night</li></ol>',
      ingredients: '<p>Turmeric Extract, Niacinamide, Vitamin C, Hyaluronic Acid, Shea Butter, Vitamin E</p>',
      variants: [
        { sku: 'MTF-50G', name: '50g Jar', price: 3200, discount: 400, stock: 50 },
        { sku: 'MTF-100G', name: '100g Jar', price: 5500, discount: 700, stock: 30 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=600', alt: 'Mooyam Turmeric Face Cream' }]
    },
    {
      name: 'African Black Soap',
      slug: 'african-black-soap',
      description: 'Traditional African black soap handmade with plantain skins, cocoa pods, palm oil, and shea butter. Naturally cleanses, exfoliates, and helps with acne, eczema, and hyperpigmentation.',
      categoryId: soapCategory.id,
      brandId: naturalGlowBrand.id,
      isNew: false,
      isBestSeller: true,
      howToUse: '<p>Lather between hands with water and apply to wet skin. Massage gently and rinse. Can be used on face and body.</p>',
      ingredients: '<p>Plantain Skin Ash, Cocoa Pod Ash, Palm Kernel Oil, Shea Butter, Coconut Oil</p>',
      variants: [
        { sku: 'ABS-100G', name: '100g Bar', price: 1200, stock: 100 },
        { sku: 'ABS-250G', name: '250g Bar', price: 2500, discount: 300, stock: 60 }
      ],
      images: [{ url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600', alt: 'African Black Soap' }]
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
  console.log(`📦 Created ${products.length} beauty products including:`)
  console.log(`   • Mooyam Sunscreen SPF 50+`)
  console.log(`   • Mooyam Niacinamide 10% Serum`)
  console.log(`   • Lemon Turmeric Brightening Soap`)
  console.log(`   • Collagen Boost Eye Cream`)
  console.log(`   • NIDA Brightening & Moisturizing Cream`)
  console.log(`   • Mooyam Turmeric Face Cream`)
  console.log(`   • African Black Soap`)
  console.log(`   • And more...`)
  console.log(``)
  console.log(`🏷️ Categories: Face Care, Body Oils, Serums, Moisturizers, Cleansers, Treatments, Sunscreen, Soaps`)
  console.log(`🏢 Brands: Skin1st, Mooyam, NIDA, Pure Beauty, Natural Glow, Elite Skincare`)
  console.log(``)
  console.log(`👤 Admin Login:`)
  console.log(`   Email: admin@skin1st.com`)
  console.log(`   Password: AdminPass123!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
