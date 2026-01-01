import { PrismaClient } from '@prisma/client'
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

  const product = await prisma.product.create({
    data: {
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

  console.log('Seeding completed.')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
