const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const existing = await prisma.user.findUnique({ where: { email: 'admin@oilstore.test' } })
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { email: 'admin@skin1st.test' } })
    console.log('Updated admin email to admin@skin1st.test')
  } else {
    console.log('No admin@oilstore.test user found')
  }
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(async ()=>{await prisma.$disconnect()})