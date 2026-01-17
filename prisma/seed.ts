import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@dentalize.com' },
    update: {},
    create: {
      email: 'demo@dentalize.com',
      name: 'Dr. Demo',
      passwordHash,
    },
  })

  console.log('✅ Demo user created:')
  console.log('   Email: demo@dentalize.com')
  console.log('   Senha: demo123')

  // Create some demo services
  const limpeza = await prisma.service.create({
    data: {
      name: 'Limpeza',
      description: 'Limpeza dental completa',
      duration: 30,
      price: 150.00,
      color: '#10B981', // green
    },
  })

  const obturacao = await prisma.service.create({
    data: {
      name: 'Obturação',
      description: 'Restauração de cárie',
      duration: 60,
      price: 300.00,
      color: '#3B82F6', // blue
    },
  })

  const canal = await prisma.service.create({
    data: {
      name: 'Canal',
      description: 'Tratamento de canal',
      duration: 120,
      price: 800.00,
      color: '#EF4444', // red
    },
  })

  console.log('✅ Demo services created')

  // Create some demo clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      notes: 'Cliente desde 2020',
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'João Santos',
      email: 'joao@example.com',
      phone: '(11) 91234-5678',
      cpf: '987.654.321-00',
      notes: 'Alergias: nenhuma',
    },
  })

  console.log('✅ Demo clients created')

  // Create some demo tasks
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  await prisma.task.create({
    data: {
      title: 'Consulta - Maria Silva',
      description: 'Limpeza de rotina',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60000),
      status: 'SCHEDULED',
      userId: user.id,
      clientId: client1.id,
      serviceId: limpeza.id,
    },
  })

  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)
  dayAfter.setHours(14, 0, 0, 0)

  await prisma.task.create({
    data: {
      title: 'Tratamento - João Santos',
      description: 'Obturação molar',
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 60 * 60000),
      status: 'SCHEDULED',
      userId: user.id,
      clientId: client2.id,
      serviceId: obturacao.id,
    },
  })

  console.log('✅ Demo tasks created')
  console.log('\n🎉 Seed completed successfully!')
  console.log('\nYou can now login with:')
  console.log('   Email: demo@dentalize.com')
  console.log('   Senha: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
