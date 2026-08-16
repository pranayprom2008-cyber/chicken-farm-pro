import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.batch.count();
  if (existingCount > 0) {
    console.log('Database already has data.');
    return;
  }

  console.log('Seeding initial poultry farm data...');

  await prisma.farm.upsert({
    where: { id: 'farm-1' },
    update: {},
    create: {
      id: 'farm-1',
      farmName: 'GreenField Bio-Secure Poultry Farm',
      location: 'Hyderabad, Telangana, India',
      ownerName: 'Venkata Farms',
      phone: '9502828293',
    },
  });

  const now = new Date();
  const batch1Start = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const batch1End = new Date(batch1Start.getTime() + 45 * 24 * 60 * 60 * 1000);

  const b1 = await prisma.batch.create({
    data: {
      batchNumber: 'B-2026-01',
      batchName: 'Monsoon Cobb-500 Flocks',
      breedType: 'Cobb 500 (Broiler)',
      startDate: batch1Start,
      expectedEndDate: batch1End,
      durationDays: 45,
      totalChicks: 5000,
      aliveChicks: 4880,
      deadChicks: 120,
      status: 'growing',
      notes: 'High vigor flock, optimal temperature 31°C maintained.',
    },
  });

  const batch2Start = new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000);
  const batch2End = new Date(batch2Start.getTime() + 42 * 24 * 60 * 60 * 1000);

  const b2 = await prisma.batch.create({
    data: {
      batchNumber: 'B-2025-12',
      batchName: 'Winter Ross-308 Batch',
      breedType: 'Ross 308 (Broiler)',
      startDate: batch2Start,
      expectedEndDate: batch2End,
      actualEndDate: batch2End,
      durationDays: 42,
      totalChicks: 4500,
      aliveChicks: 4390,
      deadChicks: 110,
      status: 'completed',
      notes: 'Harvested at average weight 2.35 kg with FCR 1.58.',
    },
  });

  for (let day = 1; day <= 28; day += 3) {
    const recDate = new Date(batch1Start.getTime() + day * 24 * 60 * 60 * 1000);
    const estWeight = 0.045 + (day / 45) * 2.1;
    await prisma.dailyBatchRecord.create({
      data: {
        batchId: b1.id,
        date: recDate,
        aliveChicks: 5000 - Math.round(day * 4.2),
        deadChicks: Math.round(Math.random() * 4 + 1),
        feedConsumed: Math.round(day * 18.5),
        averageWeight: Number(estWeight.toFixed(3)),
        notes: `Day ${day} weight check: ${(estWeight * 1000).toFixed(0)}g`,
      },
    });
  }

  await prisma.feed.create({
    data: {
      batchId: b1.id,
      date: new Date(batch1Start.getTime() + 2 * 24 * 60 * 60 * 1000),
      quantity: 120,
      price: 2150,
      totalCost: 258000,
      supplier: 'Godrej Agrovet Feed',
      notes: 'Pre-starter & Starter Crumbs',
    },
  });

  await prisma.feed.create({
    data: {
      batchId: b1.id,
      date: new Date(batch1Start.getTime() + 18 * 24 * 60 * 60 * 1000),
      quantity: 160,
      price: 2050,
      totalCost: 328000,
      supplier: 'Suguna Feeds Ltd.',
      notes: 'Finisher Pellets Phase 1',
    },
  });

  await prisma.medicine.create({
    data: {
      batchId: b1.id,
      medicineName: 'Newcastle Disease LaSota Vaccine',
      quantity: 5,
      cost: 3800,
      purpose: 'Day 7 Eye drop / Drinking water vaccination',
      notes: 'Cold chain strictly maintained',
      date: new Date(batch1Start.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.labour.create({
    data: {
      batchId: b1.id,
      employeeName: 'Ramesh Kumar (Supervisor)',
      daysWorked: 28,
      dailyWage: 600,
      totalCost: 16800,
      date: new Date(batch1Start.getTime() + 28 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.electricity.create({
    data: {
      batchId: b1.id,
      billDate: new Date(batch1Start.getTime() + 25 * 24 * 60 * 60 * 1000),
      unitsConsumed: 1850,
      amount: 14800,
      notes: 'Tunnel ventilation fans & LED brooder heating',
    },
  });

  await prisma.maintenance.create({
    data: {
      batchId: b1.id,
      description: 'Nipple drinker line sanitization & Fogger nozzle servicing',
      amount: 4500,
      date: new Date(batch1Start.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.sales.create({
    data: {
      batchId: b2.id,
      chickensSold: 4390,
      averageWeight: 2.35,
      pricePerKg: 108,
      totalRevenue: 1114182,
      buyer: 'Hyderabad Wholesale Live Bird Market',
      notes: 'Full flock lift on Day 42. Excellent bird quality.',
      saleDate: batch2End,
    },
  });

  await prisma.billingCalculation.create({
    data: {
      batchId: b1.id,
      type: 'chick_purchase',
      chickRate: 38,
      numberOfChicks: 5000,
      totalAmount: 190000,
      notes: 'Initial day-old chick placement booking (Cobb 500)',
      date: batch1Start,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Vaccination Due: Batch B-2026-01',
      message: 'Day 28 Deworming and Respiratory booster due tomorrow.',
      type: 'warning',
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
