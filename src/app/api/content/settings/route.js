import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/content/settings — Public: returns all site settings as key-value object
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    for (const s of settings) {
      // Parse JSON values where applicable
      try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Settings error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH /api/content/settings — Admin: update a setting
export async function PATCH(request) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
    }

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
      create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
