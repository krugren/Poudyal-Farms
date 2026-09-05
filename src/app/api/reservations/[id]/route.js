import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/reservations/:id — Update status (admin)
export async function PATCH(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    console.error('Reservation update error:', err);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}
