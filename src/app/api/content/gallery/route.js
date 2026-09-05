import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content/gallery — Returns all active gallery images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = { isActive: true };
    if (category && category !== 'all') where.category = category;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(images, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Gallery error:', err);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
