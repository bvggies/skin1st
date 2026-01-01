require('dotenv').config({ path: '.env' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProducts() {
  try {
    const count = await prisma.product.count()
    console.log(`\n📦 Products in database: ${count}\n`)
    
    if (count === 0) {
      console.log('❌ No products found! Run the seed script:')
      console.log('   cd api && node ../prisma/seed.js\n')
    } else {
      const products = await prisma.product.findMany({
        take: 5,
        include: {
          images: true,
          variants: true,
          category: true,
          brand: true
        }
      })
      
      console.log('Sample products:')
      products.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`)
        console.log(`   Slug: ${p.slug}`)
        console.log(`   Category: ${p.category?.name || 'None'}`)
        console.log(`   Brand: ${p.brand?.name || 'None'}`)
        console.log(`   Images: ${p.images.length}`)
        console.log(`   Variants: ${p.variants.length}`)
        console.log(`   isNew: ${p.isNew}, isBestSeller: ${p.isBestSeller}`)
      })
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()

