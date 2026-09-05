import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/admin/stats — Dashboard statistics (admin only)
export async function GET(request) {
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [enquiryStats, reservationStats, feedbackStats] = await Promise.all([
      prisma.enquiry.aggregate({
        _count: true,
      }),
      prisma.reservation.aggregate({
        _count: true,
      }),
      prisma.feedback.aggregate({
        where: { isVisible: true },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    // Count by status
    const [newEnquiries, pendingReservations, confirmedReservations] = await Promise.all([
      prisma.enquiry.count({ where: { status: 'new' } }),
      prisma.reservation.count({ where: { status: 'pending' } }),
      prisma.reservation.count({ where: { status: 'confirmed' } }),
    ]);

    return NextResponse.json({
      enquiries: { total: enquiryStats._count, new: newEnquiries },
      reservations: { total: reservationStats._count, pending: pendingReservations, confirmed: confirmedReservations },
      feedback: { total: feedbackStats._count, averageRating: feedbackStats._avg.rating ? parseFloat(feedbackStats._avg.rating.toFixed(1)) : 0 },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
