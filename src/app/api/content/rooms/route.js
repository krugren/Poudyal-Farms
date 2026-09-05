import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content/rooms — Returns all active room types with parsed amenities
export async function GET() {
  try {
    const rooms = await prisma.roomType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Parse amenities JSON
    const parsed = rooms.map(r => ({
      ...r,
      amenities: JSON.parse(r.amenities || '[]'),
    }));

    return NextResponse.json(parsed, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Rooms error:', err);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
