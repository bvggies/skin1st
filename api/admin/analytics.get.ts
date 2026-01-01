import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { period = '30' } = req.query as any
  const days = parseInt(period) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get statistics
  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    recentOrders,
    ordersByStatus,
    revenueByDay,
    topProducts
  ] = await Promise.all([
    // Total orders in period
    prisma.order.count({
      where: { createdAt: { gte: startDate } }
    }),
    // Total revenue in period
    prisma.order.aggregate({
      where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
      _sum: { total: true }
    }),
    // Total users
    prisma.user.count(),
    // Total products
    prisma.product.count(),
    // Recent orders
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    }),
    // Revenue by day (last 7 days)
    prisma.$queryRaw`
      SELECT DATE(created_at) as date, SUM(total) as revenue
      FROM "Order"
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND status != 'CANCELLED'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    // Top products by order count
    prisma.orderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })
  ])

  // Get product details for top products
  const topProductIds = topProducts.map(p => p.variantId)
  const topProductVariants = await prisma.variant.findMany({
    where: { id: { in: topProductIds } },
    include: { product: true }
  })

  const topProductsWithDetails = topProducts.map(tp => {
    const variant = topProductVariants.find(v => v.id === tp.variantId)
    return {
      variantId: tp.variantId,
      productName: variant?.product?.name || 'Unknown',
      variantName: variant?.name || 'Unknown',
      quantity: tp._sum.quantity || 0
    }
  })

  return res.status(200).json({
    stats: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      totalProducts,
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0
    },
    ordersByStatus: ordersByStatus.map(o => ({
      status: o.status,
      count: o._count.id
    })),
    revenueByDay: revenueByDay,
    topProducts: topProductsWithDetails,
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      code: o.code,
      total: o.total,
      status: o.status,
      customer: o.user?.name || o.user?.email || 'Guest',
      createdAt: o.createdAt
    }))
  })
}

