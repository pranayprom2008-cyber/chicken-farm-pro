import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.feed.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Feed record deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete feed record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
