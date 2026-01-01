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
      where: { 
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: { total: true }
    }),
    // Total users
    prisma.user.count(),
    // Total products
    prisma.product.count(),
    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, include: { variant: { include: { product: true } } } } }
      }
    }),
    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { status: true }
    }),
    // Revenue by day
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
      },
      select: {
        total: true,
        createdAt: true
      }
    }),
    // Top products
    prisma.orderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
        }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })
  ])

  // Process revenue by day
  const revenueMap = new Map<string, number>()
  revenueByDay.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0]
    revenueMap.set(date, (revenueMap.get(date) || 0) + Number(order.total))
  })
  const revenueChart = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue: Number(revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Process orders by status
  const statusChart = ordersByStatus.map(s => ({
    status: s.status,
    count: s._count.status
  }))

  // Get top products with details
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { name: true } } }
      })
      return {
        productName: variant?.product?.name || 'Unknown',
        quantity: item._sum.quantity || 0
      }
    })
  )

  res.status(200).json({
    stats: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      totalProducts
    },
    recentOrders,
    charts: {
      ordersByStatus: statusChart,
      revenueByDay: revenueChart,
      topProducts: topProductsWithDetails
    }
  })
}

