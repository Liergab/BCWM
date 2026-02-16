/**
 * Event Seeder
 * Run: npm run seed:event
 * Requires DATABASE_URL in .env
 * Run after seed:ministry to link events to ministries (optional).
 */
import 'dotenv/config';
import { prisma, disconnectDB } from '../config/db';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  await prisma.$connect();
  console.log('Seeding events...');

  const ministries = await prisma.ministry.findMany({ take: 6 });

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const events = [
    {
      title: 'Sunday Worship Service',
      description: 'Weekly Sunday worship with preaching and communion.',
      ministryId: ministries[0]?.id ?? null,
      eventDate: addDays(baseDate, 7 - baseDate.getDay()),
      location: 'Main Sanctuary',
      attendeeLimit: 200,
      attendanceCount: 0,
      isPublished: true,
    },
    {
      title: 'Youth Fellowship Night',
      description: 'Youth gathering with games, worship, and short message.',
      ministryId: ministries[1]?.id ?? null,
      eventDate: addDays(baseDate, 6),
      location: 'Youth Hall',
      attendeeLimit: 80,
      attendanceCount: 0,
      isPublished: true,
    },
    {
      title: 'Midweek Prayer Meeting',
      description: 'Corporate prayer and intercession.',
      ministryId: ministries[4]?.id ?? null,
      eventDate: addDays(baseDate, (3 - baseDate.getDay() + 7) % 7 || 7),
      location: 'Prayer Room',
      attendeeLimit: 50,
      attendanceCount: 0,
      isPublished: true,
    },
    {
      title: 'Children Sunday School',
      description: 'Bible lessons and activities for children.',
      ministryId: ministries[2]?.id ?? null,
      eventDate: addDays(baseDate, 7 - baseDate.getDay()),
      location: 'Children Building',
      attendeeLimit: 60,
      attendanceCount: 0,
      isPublished: true,
    },
    {
      title: 'Community Outreach',
      description: 'Street evangelism and community service.',
      ministryId: ministries[3]?.id ?? null,
      eventDate: addDays(baseDate, 14),
      location: 'TBD',
      attendeeLimit: 30,
      attendanceCount: 0,
      isPublished: true,
    },
    {
      title: 'Leadership Training',
      description: 'Training for ministry leaders and volunteers.',
      ministryId: null,
      eventDate: addDays(baseDate, 21),
      location: 'Conference Room',
      attendeeLimit: 25,
      attendanceCount: 0,
      isPublished: false,
    },
  ];

  for (const data of events) {
    const created = await prisma.event.create({
      data,
    });
    console.log(`  Created: ${created.title} (id: ${created.id}, date: ${created.eventDate.toISOString().slice(0, 10)})`);
  }

  console.log('Event seed completed.');
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
