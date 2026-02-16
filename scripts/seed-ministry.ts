/**
 * Ministry Seeder
 * Run: npm run seed:ministry
 * Requires DATABASE_URL in .env
 * Run after seed:users if you want ministries linked to leader users.
 */
import 'dotenv/config';
import { prisma, disconnectDB } from '../config/db';

const ministries = [
  {
    name: 'Worship Ministry',
    description: 'Leads Sunday worship, music, and praise team.',
    isActive: true,
    scheduleDay: 'Sunday',
    scheduleTime: '08:00',
  },
  {
    name: 'Youth Ministry',
    description: 'Discipleship and activities for youth (13–25).',
    isActive: true,
    scheduleDay: 'Saturday',
    scheduleTime: '14:00',
  },
  {
    name: 'Children Ministry',
    description: 'Sunday school and children’s programs.',
    isActive: true,
    scheduleDay: 'Sunday',
    scheduleTime: '09:00',
  },
  {
    name: 'Outreach Ministry',
    description: 'Community outreach and evangelism.',
    isActive: true,
    scheduleDay: 'Saturday',
    scheduleTime: '09:00',
  },
  {
    name: 'Prayer Ministry',
    description: 'Intercession and midweek prayer meetings.',
    isActive: true,
    scheduleDay: 'Wednesday',
    scheduleTime: '19:00',
  },
  {
    name: 'Finance Ministry',
    description: 'Tithes, offerings, and financial stewardship.',
    isActive: true,
  },
  {
    name: 'Hospitality Ministry',
    description: 'Welcome, ushering, and fellowship.',
    isActive: true,
    scheduleDay: 'Sunday',
    scheduleTime: '08:30',
  },
];

async function seed() {
  await prisma.$connect();
  console.log('Seeding ministries...');

  for (const data of ministries) {
    const created = await prisma.ministry.upsert({
      where: { name: data.name },
      create: data,
      update: { description: data.description, isActive: data.isActive, scheduleDay: data.scheduleDay, scheduleTime: data.scheduleTime },
    });
    console.log(`  Created/updated: ${created.name} (id: ${created.id})`);
  }

  console.log('Ministry seed completed.');
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
