import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ALLOWED_PHONES = ['9502828293', '9849852085'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    // Direct phone authentication strictly for John & Pranay
    if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (!ALLOWED_PHONES.includes(cleanPhone)) {
        return NextResponse.json(
          { error: 'Access Denied. Only John (9502828293) and Pranay (9849852085) have admin access.' },
          { status: 403 }
        );
      }

      const isOwner = cleanPhone === '9502828293';
      const adminName = isOwner ? 'John' : 'Pranay';
      const adminRole = isOwner ? 'Farm Owner' : 'Manager & Tech Lead';

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN_PHONE',
            details: `${adminName} (${adminRole}) logged in via ${cleanPhone}`,
            user: adminName,
          },
        });
      } catch (err) {
        console.warn('Could not write activity log', err);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: `admin-${cleanPhone}`,
          name: adminName,
          phone: cleanPhone,
          role: adminRole,
        },
        token: `jwt-session-${cleanPhone}-${Date.now()}`,
      });
    }

    return NextResponse.json(
      { error: 'Please provide an authorized phone number (9502828293 / 9849852085).' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server authentication error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
