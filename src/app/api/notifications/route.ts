import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch persistent notifications
    let notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 2. Generate dynamic intelligent reminders if needed
    const activeBatches = await prisma.batch.findMany({ where: { status: 'growing' } });
    const now = new Date();

    for (const b of activeBatches) {
      const start = new Date(b.startDate);
      const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Day 7: Newcastle Vaccine
      if (daysElapsed >= 6 && daysElapsed <= 8) {
        const title = `Vaccination Due: Batch ${b.batchNumber}`;
        const existing = notifications.find((n) => n.title === title);
        if (!existing) {
          await prisma.notification.create({
            data: {
              title,
              message: `Day 7 Newcastle Disease (ND) LaSota booster due for Batch ${b.batchNumber} (${b.aliveChicks} chicks).`,
              type: 'warning',
            },
          });
        }
      }

      // Day 14: Gumboro Vaccine
      if (daysElapsed >= 13 && daysElapsed <= 15) {
        const title = `Gumboro (IBD) Vaccine Due: Batch ${b.batchNumber}`;
        const existing = notifications.find((n) => n.title === title);
        if (!existing) {
          await prisma.notification.create({
            data: {
              title,
              message: `Day 14 Infectious Bursal Disease (Gumboro) vaccination due for Batch ${b.batchNumber}.`,
              type: 'warning',
            },
          });
        }
      }

      // Batch completion approaching (>= 40 days)
      if (daysElapsed >= 40) {
        const title = `Batch Completion Ready: ${b.batchNumber}`;
        const existing = notifications.find((n) => n.title === title);
        if (!existing) {
          await prisma.notification.create({
            data: {
              title,
              message: `Batch ${b.batchNumber} has reached ${daysElapsed} days! Average harvest target weight reached. Prepare for sale.`,
              type: 'info',
            },
          });
        }
      }
    }

    // Refresh notifications list
    notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notifications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, type = 'info' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const n = await prisma.notification.create({
      data: { title, message, type },
    });

    return NextResponse.json(n, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    // Mark all as read
    await prisma.notification.updateMany({
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark notifications read';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
