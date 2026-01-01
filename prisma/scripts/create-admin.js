const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const email = args[0] || 'admin@example.com'
  const password = args[1] || 'Admin123!'
  const name = args[2] || 'Admin User'

  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password> [name]')
    process.exit(1)
  }

  const hashed = await bcrypt.hash(password, 10)
  
  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashed,
        role: 'ADMIN',
        name: name,
        enabled: true
      },
      create: {
        email,
        password: hashed,
        role: 'ADMIN',
        name: name,
        enabled: true
      }
    })
    
    console.log('✅ Admin user created/updated successfully!')
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('\n⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

