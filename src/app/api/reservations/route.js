import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// ── IP rate limiting: two-tier — burst + hourly ceiling ──────────────────
// Tier 1: max 5 requests per 60 seconds  → stops bots & automated attacks
// Tier 2: max 50 requests per hour        → stops extreme sustained abuse
// A real guest correcting a mistake will never hit either limit.
const rateLimitMap = new Map(); // ip -> { minute: {count, windowStart}, hour: {count, windowStart} }

const BURST_LIMIT    = 5;
const BURST_WINDOW   = 60 * 1000;        // 60 seconds
const HOURLY_LIMIT   = 50;
const HOURLY_WINDOW  = 60 * 60 * 1000;   // 1 hour

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { minute: null, hour: null };

  // ── Burst window (60s) ──
  if (!entry.minute || now - entry.minute.windowStart > BURST_WINDOW) {
    entry.minute = { count: 1, windowStart: now };
  } else if (entry.minute.count >= BURST_LIMIT) {
    return { allowed: false, reason: 'Too many requests. Please wait a moment and try again.' };
  } else {
    entry.minute.count++;
  }

  // ── Hourly ceiling ──
  if (!entry.hour || now - entry.hour.windowStart > HOURLY_WINDOW) {
    entry.hour = { count: 1, windowStart: now };
  } else if (entry.hour.count >= HOURLY_LIMIT) {
    return { allowed: false, reason: 'Too many requests today. Please try again later.' };
  } else {
    entry.hour.count++;
  }

  rateLimitMap.set(ip, entry);
  return { allowed: true };
}

// POST /api/reservations — Submit reservation (public)
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: rl.reason }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, checkIn, checkOut, guests, roomType, specialRequests, website } = body;

    // Honeypot
    if (website) return NextResponse.json({ success: true, message: 'Thank you!' });

    // Validation
    const cleanName = sanitize(name, 100);
    const cleanEmail = sanitize(email, 200);
    const cleanPhone = sanitize(phone, 20);

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Valid name required' }, { status: 400 });
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!cleanPhone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    if (!checkIn || !checkOut) return NextResponse.json({ error: 'Check-in and check-out dates required' }, { status: 400 });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
    if (checkInDate < new Date(new Date().setHours(0,0,0,0))) return NextResponse.json({ error: 'Cannot book past dates' }, { status: 400 });

    const guestCount = parseInt(guests) || 1;
    if (guestCount < 1 || guestCount > 20) return NextResponse.json({ error: 'Guests must be between 1-20' }, { status: 400 });

    const validRoomTypes = ['farm-cottage', 'heritage-room', 'mountain-suite', 'farm-tour'];
    if (!validRoomTypes.includes(roomType)) return NextResponse.json({ error: 'Invalid room type' }, { status: 400 });

    const reservation = await prisma.reservation.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
        roomType,
        specialRequests: sanitize(specialRequests || '', 500),
      },
    });

    return NextResponse.json({ success: true, message: 'Reservation submitted!', id: reservation.id }, { status: 201 });
  } catch (err) {
    console.error('Reservation error:', err);
    return NextResponse.json({ error: 'Failed to submit reservation' }, { status: 500 });
  }
}

// GET /api/reservations — List reservations (admin only)
export async function GET(request) {
  const { requireAuth } = await import('@/lib/auth');
  const auth = requireAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');

    const where = status ? { status } : {};
    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      reservations,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Reservations list error:', err);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}
