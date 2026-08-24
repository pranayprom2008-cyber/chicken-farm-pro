import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name } = body;

    if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit phone number.' },
          { status: 400 }
        );
      }

      const userName = name || `Farmer ${cleanPhone.slice(-4)}`;
      const userRole = 'Farm Lead';

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'LOGIN_PHONE',
            details: `${userName} (${userRole}) logged in via ${cleanPhone}`,
            user: userName,
          },
        });
      } catch (err) {
        console.warn('Could not write activity log', err);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: `usr-${cleanPhone}`,
          name: userName,
          phone: cleanPhone,
          role: userRole,
        },
        token: `jwt-session-${cleanPhone}-${Date.now()}`,
      });
    }

    return NextResponse.json(
      { error: 'Please provide a valid phone number.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server authentication error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
