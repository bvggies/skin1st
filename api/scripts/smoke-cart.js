const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  console.log('Starting smoke tests for carts...')

  // find an existing variant
  const variant = await prisma.variant.findFirst()
  if (!variant) throw new Error('No variant found in DB; ensure seed ran')

  // create test user
  const email = `smoke_${Date.now()}@test.local`
  const password = 'password123'
  const user = await prisma.user.create({ data: { email, password, name: 'Smoke Test' } })
  console.log('Created test user', user.id)

  // ensure user has no cart
  await prisma.cart.deleteMany({ where: { userId: user.id } })

  // create guest cart
  const token = `smoke_guest_${Date.now()}`
  const guestCart = await prisma.cart.create({ data: { cartToken: token } })
  await prisma.cartItem.create({ data: { cartId: guestCart.id, variantId: variant.id, quantity: 2 } })
  console.log('Created guest cart', token)

  // create a pre-existing user cart with 1 of same variant
  const userCart = await prisma.cart.create({ data: { userId: user.id } })
  await prisma.cartItem.create({ data: { cartId: userCart.id, variantId: variant.id, quantity: 1 } })
  console.log('Created user cart with one item')

  // perform merge (simulate mergeCart logic)
  const guestItems = await prisma.cartItem.findMany({ where: { cartId: guestCart.id } })
  for (const it of guestItems){
    const existing = await prisma.cartItem.findFirst({ where: { cartId: userCart.id, variantId: it.variantId } })
    if (existing){
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + it.quantity } })
    } else {
      await prisma.cartItem.create({ data: { cartId: userCart.id, variantId: it.variantId, quantity: it.quantity } })
    }
  }

  const merged = await prisma.cart.findUnique({ where: { id: userCart.id }, include: { items: true } })
  console.log('Merged cart items:', merged.items)
  const expectedQty = merged.items.find(it => it.variantId === variant.id).quantity
  if (expectedQty !== 3) throw new Error(`Merge failed: expected quantity 3, got ${expectedQty}`)

  // delete guest cart items then cart and ensure cookie would be cleared
  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } })
  await prisma.cart.delete({ where: { id: guestCart.id } })
  const foundGuest = await prisma.cart.findUnique({ where: { id: guestCart.id } })
  if (foundGuest) throw new Error('Guest cart deletion failed')

  // simulate logout: convert user cart to guest token
  const newToken = `smoke_guest_after_logout_${Date.now()}`
  await prisma.cart.update({ where: { id: userCart.id }, data: { userId: null, cartToken: newToken } })
  const converted = await prisma.cart.findUnique({ where: { id: userCart.id } })
  if (!converted || converted.userId !== null || converted.cartToken !== newToken) throw new Error('Logout conversion failed')

  console.log('Logout conversion succeeded, token set:', newToken)

  // cleanup: delete cart items, cart and user
  await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } })
  await prisma.cart.delete({ where: { id: userCart.id } })
  await prisma.user.delete({ where: { id: user.id } })

  console.log('Smoke tests passed ✅')
}

main()
  .catch(e=>{ console.error('Smoke test failed:', e); process.exit(1) })
  .finally(async ()=>{ await prisma.$disconnect() })
