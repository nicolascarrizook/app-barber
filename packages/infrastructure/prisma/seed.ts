import { PrismaClient } from '../node_modules/.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.appointment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.service.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.domainEvent.deleteMany()

  console.log('✅ Cleared existing data')

  // Create Barbers
  const barber1 = await prisma.barber.create({
    data: {
      id: 'barber-1',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@barbershop.com',
      phone: '+5491112345678',
      specialties: ['HAIRCUT', 'BEARD', 'STYLING'],
      schedule: {
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '20:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { available: false }
      },
      status: 'ACTIVE',
      commissionRate: 50,
      rating: 4.8,
      totalAppointments: 120,
      profileImageUrl: 'https://i.pravatar.cc/150?img=12',
      bio: 'Especialista en cortes modernos y barba con más de 10 años de experiencia.'
    }
  })

  const barber2 = await prisma.barber.create({
    data: {
      id: 'barber-2',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@barbershop.com',
      phone: '+5491123456789',
      specialties: ['HAIRCUT', 'COLORING', 'TREATMENT'],
      schedule: {
        monday: { start: '10:00', end: '19:00', available: true },
        tuesday: { start: '10:00', end: '19:00', available: true },
        wednesday: { start: '10:00', end: '19:00', available: true },
        thursday: { start: '10:00', end: '19:00', available: true },
        friday: { start: '10:00', end: '19:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { available: false }
      },
      status: 'ACTIVE',
      commissionRate: 55,
      rating: 4.9,
      totalAppointments: 150,
      profileImageUrl: 'https://i.pravatar.cc/150?img=47',
      bio: 'Experta en coloración y tratamientos capilares de alta gama.'
    }
  })

  const barber3 = await prisma.barber.create({
    data: {
      id: 'barber-3',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@barbershop.com',
      phone: '+5491134567890',
      specialties: ['BEARD', 'STYLING'],
      schedule: {
        monday: { available: false },
        tuesday: { start: '14:00', end: '22:00', available: true },
        wednesday: { start: '14:00', end: '22:00', available: true },
        thursday: { start: '14:00', end: '22:00', available: true },
        friday: { start: '14:00', end: '22:00', available: true },
        saturday: { start: '10:00', end: '18:00', available: true },
        sunday: { start: '10:00', end: '14:00', available: true }
      },
      status: 'ACTIVE',
      commissionRate: 45,
      rating: 4.7,
      totalAppointments: 80,
      profileImageUrl: 'https://i.pravatar.cc/150?img=68',
      bio: 'Maestro barbero especializado en estilos clásicos y modernos.'
    }
  })

  console.log('✅ Created 3 barbers')

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      id: 'client-1',
      firstName: 'Pedro',
      lastName: 'Martínez',
      email: 'pedro.martinez@email.com',
      phone: '+5491145678901',
      status: 'ACTIVE',
      preferences: {
        language: 'es',
        receivePromotions: true,
        receiveReminders: true,
        preferredContactMethod: 'whatsapp'
      },
      totalAppointments: 15,
      completedAppointments: 14,
      cancelledAppointments: 1,
      noShowAppointments: 0,
      lifetimeValue: 12500,
      lifetimeValueCurrency: 'ARS',
      totalPoints: 150,
      loyaltyTier: 'GOLD',
      firstVisit: new Date('2024-01-15'),
      lastVisit: new Date('2024-10-20'),
      notes: 'Prefiere cortes clásicos. Alérgico a ciertos productos de coloración.'
    }
  })

  const client2 = await prisma.client.create({
    data: {
      id: 'client-2',
      firstName: 'Ana',
      lastName: 'López',
      email: 'ana.lopez@email.com',
      phone: '+5491156789012',
      status: 'ACTIVE',
      preferences: {
        language: 'es',
        receivePromotions: true,
        receiveReminders: true,
        preferredContactMethod: 'email'
      },
      totalAppointments: 5,
      completedAppointments: 5,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      lifetimeValue: 4500,
      lifetimeValueCurrency: 'ARS',
      totalPoints: 50,
      loyaltyTier: 'SILVER',
      firstVisit: new Date('2024-08-01'),
      lastVisit: new Date('2024-10-15'),
      notes: 'Cliente nueva, prefiere María como estilista.'
    }
  })

  const client3 = await prisma.client.create({
    data: {
      id: 'client-3',
      firstName: 'Roberto',
      lastName: 'Sánchez',
      email: 'roberto.sanchez@email.com',
      phone: '+5491167890123',
      status: 'ACTIVE',
      preferences: {
        language: 'es',
        receivePromotions: false,
        receiveReminders: true,
        preferredContactMethod: 'sms'
      },
      totalAppointments: 2,
      completedAppointments: 2,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      lifetimeValue: 1800,
      lifetimeValueCurrency: 'ARS',
      totalPoints: 20,
      loyaltyTier: 'BRONZE',
      firstVisit: new Date('2024-10-01'),
      lastVisit: new Date('2024-10-10'),
      notes: ''
    }
  })

  console.log('✅ Created 3 clients')

  // Create Services
  const service1 = await prisma.service.create({
    data: {
      id: 'service-1',
      name: 'Corte de Cabello Clásico',
      description: 'Corte de cabello tradicional con máquina y tijera. Incluye lavado y secado.',
      durationMinutes: 30,
      price: 800,
      currency: 'ARS',
      category: 'HAIRCUT',
      requiredSkills: ['HAIRCUT'],
      isActive: true
    }
  })

  const service2 = await prisma.service.create({
    data: {
      id: 'service-2',
      name: 'Corte de Cabello Premium',
      description: 'Corte de cabello moderno con diseño personalizado. Incluye lavado, tratamiento y styling.',
      durationMinutes: 45,
      price: 1200,
      currency: 'ARS',
      category: 'HAIRCUT',
      requiredSkills: ['HAIRCUT', 'STYLING'],
      isActive: true
    }
  })

  const service3 = await prisma.service.create({
    data: {
      id: 'service-3',
      name: 'Arreglo de Barba',
      description: 'Perfilado y arreglo completo de barba con máquina y navaja. Incluye aceites.',
      durationMinutes: 20,
      price: 500,
      currency: 'ARS',
      category: 'BEARD',
      requiredSkills: ['BEARD'],
      isActive: true
    }
  })

  const service4 = await prisma.service.create({
    data: {
      id: 'service-4',
      name: 'Barba y Bigote Premium',
      description: 'Servicio completo de barba y bigote con tratamiento hidratante y masaje facial.',
      durationMinutes: 40,
      price: 900,
      currency: 'ARS',
      category: 'BEARD',
      requiredSkills: ['BEARD', 'TREATMENT'],
      isActive: true
    }
  })

  const service5 = await prisma.service.create({
    data: {
      id: 'service-5',
      name: 'Coloración',
      description: 'Servicio de coloración profesional. Incluye lavado, color y tratamiento post-color.',
      durationMinutes: 90,
      price: 2500,
      currency: 'ARS',
      category: 'COLORING',
      requiredSkills: ['COLORING', 'TREATMENT'],
      isActive: true
    }
  })

  const service6 = await prisma.service.create({
    data: {
      id: 'service-6',
      name: 'Combo Corte + Barba',
      description: 'Combo de corte de cabello clásico + arreglo de barba.',
      durationMinutes: 50,
      price: 1100,
      currency: 'ARS',
      category: 'HAIRCUT',
      requiredSkills: ['HAIRCUT', 'BEARD'],
      isActive: true
    }
  })

  console.log('✅ Created 6 services')

  // Create sample appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const appointment1 = await prisma.appointment.create({
    data: {
      id: 'appointment-1',
      barberId: barber1.id,
      clientId: client1.id,
      serviceId: service2.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 45 * 60000),
      status: 'CONFIRMED',
      notes: 'Cliente VIP - Atención personalizada'
    }
  })

  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
  dayAfterTomorrow.setHours(15, 0, 0, 0)

  const appointment2 = await prisma.appointment.create({
    data: {
      id: 'appointment-2',
      barberId: barber2.id,
      clientId: client2.id,
      serviceId: service5.id,
      startTime: dayAfterTomorrow,
      endTime: new Date(dayAfterTomorrow.getTime() + 90 * 60000),
      status: 'PENDING'
    }
  })

  console.log('✅ Created 2 appointments')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
