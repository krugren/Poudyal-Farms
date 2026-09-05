import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Sanitize strings — strip HTML tags and limit length
function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// POST /api/enquiries — Submit enquiry (public)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, website } = body;

    // Honeypot check
    if (website) {
      return NextResponse.json({ success: true, message: 'Thank you!' }); // Silent reject
    }

    // Validation
    const cleanName = sanitize(name, 100);
    const cleanEmail = sanitize(email, 200);
    const cleanSubject = sanitize(subject, 200);
    const cleanMessage = sanitize(message, 2000);

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Valid name required' }, { status: 400 });
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!cleanSubject) return NextResponse.json({ error: 'Subject required' }, { status: 400 });
    if (!cleanMessage || cleanMessage.length < 5) return NextResponse.json({ error: 'Message must be at least 5 characters' }, { status: 400 });

    const enquiry = await prisma.enquiry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: sanitize(phone || '', 20),
        subject: cleanSubject,
        message: cleanMessage,
      },
    });

    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully', id: enquiry.id }, { status: 201 });
  } catch (err) {
    console.error('Enquiry error:', err);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}

// GET /api/enquiries — List enquiries (admin only)
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
    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      enquiries,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Enquiries list error:', err);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}
