require('dotenv').config({ path: '../.env' })
require('dotenv').config({ path: '../.env' })
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding sample categories, brands, products...')

  const oilsCategory = await prisma.category.upsert({
    where: { slug: 'engine-oil' },
    update: {},
    create: { name: 'Engine Oils', slug: 'engine-oil' }
  })

  const brandA = await prisma.brand.upsert({
    where: { slug: 'pure-oil' },
    update: {},
    create: { name: 'Pure Oil Co', slug: 'pure-oil' }
  })

  const product = await prisma.product.upsert({
    where: { slug: 'ultra-engine-oil-5w30' },
    update: {},
    create: {
      name: 'Ultra Engine Oil 5W-30',
      slug: 'ultra-engine-oil-5w30',
      description: 'Premium synthetic engine oil for modern engines',
      categoryId: oilsCategory.id,
      brandId: brandA.id,
      isNew: true,
      variants: {
        create: [
          { sku: 'UO-5W30-1L', name: '1L Bottle', price: 8000, stock: 50 },
          { sku: 'UO-5W30-4L', name: '4L Jug', price: 28000, stock: 20 }
        ]
      },
      images: { create: [{ url: 'https://placehold.co/600x400', alt: 'Ultra 5W-30' }] }
    }
  })

  // create demo admin and customer users
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

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
