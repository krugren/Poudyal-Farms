import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/enquiries/:id — Update enquiry status (admin)
export async function PATCH(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['new', 'read', 'replied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (err) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    console.error('Enquiry update error:', err);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
