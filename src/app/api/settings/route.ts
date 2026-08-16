import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 'default-setting',
          farmName: 'GreenField Poultry Farm',
          currency: '₹',
          language: 'en',
          theme: 'dark',
        },
      });
    }
    return NextResponse.json(setting);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { farmName, currency, language, theme, logoUrl } = body;

    const setting = await prisma.setting.upsert({
      where: { id: 'default-setting' },
      update: {
        farmName: farmName || undefined,
        currency: currency || undefined,
        language: language || undefined,
        theme: theme || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      },
      create: {
        id: 'default-setting',
        farmName: farmName || 'GreenField Poultry Farm',
        currency: currency || '₹',
        language: language || 'en',
        theme: theme || 'dark',
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json(setting);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
