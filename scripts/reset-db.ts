import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAllData() {
  console.log('Resetting all existing farm data for fresh start...');

  await prisma.dailyBatchRecord.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.feed.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.labour.deleteMany();
  await prisma.electricity.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.sales.deleteMany();
  await prisma.billingCalculation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.batch.deleteMany();

  await prisma.setting.upsert({
    where: { id: 'default-setting' },
    update: {
      farmName: 'GreenField Bio-Secure Poultry Farm',
      currency: '₹',
      theme: 'liquid',
    },
    create: {
      id: 'default-setting',
      farmName: 'GreenField Bio-Secure Poultry Farm',
      currency: '₹',
      theme: 'liquid',
    },
  });

  console.log('SUCCESS: All records deleted. Database is completely fresh and empty!');
}

resetAllData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
