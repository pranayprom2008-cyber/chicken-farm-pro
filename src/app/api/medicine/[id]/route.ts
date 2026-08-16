import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.medicine.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Medicine record deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete medicine record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
