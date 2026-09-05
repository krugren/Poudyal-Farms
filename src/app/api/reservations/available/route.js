import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reservations/available?month=6&year=2026
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month'));
    const year = parseInt(searchParams.get('year'));

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year required' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        checkIn: { lte: endDate },
        checkOut: { gte: startDate },
      },
      select: { checkIn: true, checkOut: true, roomType: true },
    });

    // Build date-availability map
    const bookedDates = {};
    for (const r of reservations) {
      let current = new Date(r.checkIn);
      const end = new Date(r.checkOut);
      while (current < end) {
        const dateKey = current.toISOString().split('T')[0];
        if (!bookedDates[dateKey]) bookedDates[dateKey] = [];
        bookedDates[dateKey].push(r.roomType);
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({ bookedDates }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('Availability error:', err);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
