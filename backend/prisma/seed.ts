import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const main = async () => {
  console.log('🌱 Seeding database...');

  const hashedPassword = await hashPassword('Password123!');

  const owner = await prisma.user.create({
    data: {
      email: 'abbey@elitebarbershop.com',
      firstName: 'Abiodun',
      lastName: 'Bello',
      passwordHash: hashedPassword,
      role: UserRole.BUSINESS_OWNER,
      isEmailVerified: true,
      phoneNumber: '+2348012345678',
    },
  });

  console.log('✅ Created business owner:', owner.email);
};

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
