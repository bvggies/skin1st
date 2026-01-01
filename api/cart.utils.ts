import prisma from './db'

export async function mergeCart(userId: string, items: { variantId: string; quantity: number }[]) {
  if (!Array.isArray(items) || items.length === 0) {
    const cart = await prisma.cart.findFirst({ where: { userId }, include: { items: { include: { variant: { include: { product: true } } } } } })
    return cart
  }

  let cart = await prisma.cart.findFirst({ where: { userId } })
  if (!cart) cart = await prisma.cart.create({ data: { userId } })

  // Use a transaction to avoid partial state
  await prisma.$transaction(async (tx) => {
    for (const it of items) {
      const existing = await tx.cartItem.findFirst({ where: { cartId: cart!.id, variantId: it.variantId } })
      if (existing) {
        await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + Number(it.quantity) } })
      } else {
        await tx.cartItem.create({ data: { cartId: cart!.id, variantId: it.variantId, quantity: Number(it.quantity) } })
      }
    }
  })

  const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { variant: { include: { product: true } } } } } })
  return updated
}
