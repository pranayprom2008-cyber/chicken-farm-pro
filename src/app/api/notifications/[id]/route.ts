import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
