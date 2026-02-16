/**
 * Church Config Seeder
 * Run: npm run seed:churchConfig
 * Requires DATABASE_URL in .env
 */
import 'dotenv/config';
import { prisma, disconnectDB } from '../config/db';

const churchConfigs = [
  {
    churchName: 'BCWM Main Church',
    shortName: 'BCWM',
    denomination: 'Christian',
    contactEmail: 'info@bcwm.org',
    contactPhone: '+639171234567',
    websiteUrl: 'https://bcwm.org',
    address: {
      street: '123 Main Street',
      barangay: 'Brgy. Central',
      city: 'Manila',
      municipality: 'Manila',
      province: 'NCR',
      postalCode: '1000',
    },
    defaultTheme: {
      primaryColor: '#1a365d',
      secondaryColor: '#2c5282',
      accentColor: '#ed8936',
      darkMode: false,
    },
    serviceSchedules: [
      {
        dayOfWeek: 'Sunday',
        serviceName: 'Sunday Worship',
        serviceTime: '09:00',
        isRecurring: true,
        locationLabel: 'Main Sanctuary',
      },
      {
        dayOfWeek: 'Sunday',
        serviceName: 'Evening Service',
        serviceTime: '18:00',
        isRecurring: true,
        locationLabel: 'Main Sanctuary',
      },
      {
        dayOfWeek: 'Wednesday',
        serviceName: 'Midweek Prayer',
        serviceTime: '19:00',
        isRecurring: true,
        locationLabel: 'Prayer Room',
      },
    ],
    branches: {
      create: [
        {
          name: 'Main Campus',
          isMain: true,
          isActive: true,
          contactEmail: 'main@bcwm.org',
          contactPhone: '+639171234567',
          address: {
            street: '123 Main Street',
            city: 'Manila',
            province: 'NCR',
            postalCode: '1000',
          },
        },
        {
          name: 'North Branch',
          isMain: false,
          isActive: true,
          contactEmail: 'north@bcwm.org',
          address: {
            street: '456 North Ave',
            city: 'Quezon City',
            province: 'NCR',
            postalCode: '1100',
          },
        },
      ],
    },
  },
  {
    churchName: 'Sample Community Church',
    shortName: 'SCC',
    denomination: 'Non-Denominational',
    contactEmail: 'hello@samplechurch.org',
    contactPhone: '+639281234567',
    websiteUrl: 'https://samplechurch.org',
    address: {
      street: '789 Church Road',
      barangay: 'Brgy. Faith',
      city: 'Cebu City',
      province: 'Cebu',
      postalCode: '6000',
    },
    defaultTheme: {
      primaryColor: '#22543d',
      secondaryColor: '#276749',
      accentColor: '#38a169',
      darkMode: false,
    },
    serviceSchedules: [
      {
        dayOfWeek: 'Sunday',
        serviceName: 'Worship Service',
        serviceTime: '10:00',
        isRecurring: true,
        locationLabel: 'Main Hall',
      },
    ],
    branches: {
      create: [
        {
          name: 'Cebu Main',
          isMain: true,
          isActive: true,
          contactEmail: 'cebu@samplechurch.org',
        },
      ],
    },
  },
];

async function seed() {
  await prisma.$connect();
  console.log('Seeding church configs...');

  for (const data of churchConfigs) {
    const created = await prisma.churchConfig.create({
      data,
      include: {
        branches: true,
      },
    });
    console.log(`  Created: ${created.churchName} (id: ${created.id}) with ${created.branches.length} branch(es)`);
  }

  console.log('Church config seed completed.');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
    process.exit(0);
  });
