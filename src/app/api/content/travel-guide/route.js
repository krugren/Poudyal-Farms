import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content/travel-guide — Returns all travel guide entries with parsed JSON
export async function GET() {
  try {
    const guides = await prisma.travelGuide.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const parsed = guides.map(g => ({
      ...g,
      entries: JSON.parse(g.entries || '[]'),
    }));

    return NextResponse.json(parsed, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Travel guide error:', err);
    return NextResponse.json({ error: 'Failed to fetch travel guide' }, { status: 500 });
  }
}
