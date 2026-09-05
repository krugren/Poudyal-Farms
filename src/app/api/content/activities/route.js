import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content/activities — Returns all active activities
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(activities, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Activities error:', err);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
