/**
 * User Seeder
 * Run: npm run seed:users
 * Creates active, verified users: 1 Super Admin, 1 Pastor, 10 Members, 2 Finance Officers, 2 Ministry Leaders.
 * Default password for all: SeedPass123!
 */
import 'dotenv/config';
import { prisma, disconnectDB } from '../config/db';
import { hashPassword } from '../config/bcrypt';
import { UserRole } from '@prisma/client';

const DEFAULT_PASSWORD = 'SeedPass123!';

type UserSeed = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const userSeeds: UserSeed[] = [
  // 1 Super Admin
  { email: 'superadmin@bcwm.org', firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
  // 1 Pastor
  { email: 'pastor@bcwm.org', firstName: 'Pastor', lastName: 'Lead', role: 'PASTOR' },
  // 2 Finance Officers
  { email: 'finance1@bcwm.org', firstName: 'Finance', lastName: 'Officer One', role: 'FINANCE_OFFICER' },
  { email: 'finance2@bcwm.org', firstName: 'Finance', lastName: 'Officer Two', role: 'FINANCE_OFFICER' },
  // 2 Ministry Leaders
  { email: 'ministry1@bcwm.org', firstName: 'Ministry', lastName: 'Leader One', role: 'MINISTRY_LEADER' },
  { email: 'ministry2@bcwm.org', firstName: 'Ministry', lastName: 'Leader Two', role: 'MINISTRY_LEADER' },
  // 10 Members
  { email: 'member1@bcwm.org', firstName: 'Member', lastName: 'One', role: 'MEMBER' },
  { email: 'member2@bcwm.org', firstName: 'Member', lastName: 'Two', role: 'MEMBER' },
  { email: 'member3@bcwm.org', firstName: 'Member', lastName: 'Three', role: 'MEMBER' },
  { email: 'member4@bcwm.org', firstName: 'Member', lastName: 'Four', role: 'MEMBER' },
  { email: 'member5@bcwm.org', firstName: 'Member', lastName: 'Five', role: 'MEMBER' },
  { email: 'member6@bcwm.org', firstName: 'Member', lastName: 'Six', role: 'MEMBER' },
  { email: 'member7@bcwm.org', firstName: 'Member', lastName: 'Seven', role: 'MEMBER' },
  { email: 'member8@bcwm.org', firstName: 'Member', lastName: 'Eight', role: 'MEMBER' },
  { email: 'member9@bcwm.org', firstName: 'Member', lastName: 'Nine', role: 'MEMBER' },
  { email: 'member10@bcwm.org', firstName: 'Member', lastName: 'Ten', role: 'MEMBER' },
];

async function seed() {
  await prisma.$connect();
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  console.log('Seeding users (all active & verified, password: SeedPass123!)...');

  for (const u of userSeeds) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  Skip (exists): ${u.email} [${u.role}]`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        role: u.role,
        status: 'ACTIVE',
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        person: {
          create: {
            firstName: u.firstName,
            lastName: u.lastName,
          },
        },
      },
      include: { person: true },
    });

    console.log(`  Created: ${user.email} [${user.role}] (id: ${user.id})`);
  }

  console.log('User seed completed.');
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
