import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content/page/:name — Returns all content for a page as structured sections
export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const rows = await prisma.siteContent.findMany({
      where: { page: name },
      orderBy: { sortOrder: 'asc' },
    });

    // Group by section
    const sections = {};
    for (const row of rows) {
      if (!sections[row.section]) sections[row.section] = {};
      sections[row.section][row.key] = row.value;
    }

    return NextResponse.json(sections, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('Page content error:', err);
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
  }
}
