import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
// Required for streaming responses — no body buffering
export const dynamic = 'force-dynamic';

const POLL_INTERVAL_MS = 5000; // Check DB every 5 seconds
const HEARTBEAT_MS     = 25000; // Keep-alive ping every 25s

export async function GET(request) {
  // Verify admin JWT from query param (EventSource can't set custom headers)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    if (!verifyToken(token)) throw new Error('Invalid token');
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  // Snapshot timestamps at connection time — only send events for items NEWER than this
  const connectedAt = new Date();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (event, data) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Initial connection acknowledgement
      send('connected', { message: 'Notification stream connected', timestamp: connectedAt.toISOString() });

      // Heartbeat to prevent proxy/browser timeouts
      const heartbeat = setInterval(() => {
        if (closed) { clearInterval(heartbeat); return; }
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          closed = true;
          clearInterval(heartbeat);
        }
      }, HEARTBEAT_MS);

      // Poll DB for new items
      const poll = setInterval(async () => {
        if (closed) { clearInterval(poll); return; }
        try {
          const since = connectedAt;

          const [newReservations, newEnquiries, newReviews] = await Promise.all([
            prisma.reservation.findMany({
              where: { createdAt: { gt: since } },
              select: { id: true, guestName: true, roomType: true, checkIn: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            }).catch(() => []),
            prisma.enquiry.findMany({
              where: { createdAt: { gt: since } },
              select: { id: true, name: true, subject: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            }).catch(() => []),
            prisma.feedback.findMany({
              where: { createdAt: { gt: since } },
              select: { id: true, name: true, rating: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            }).catch(() => []),
          ]);

          if (newReservations.length > 0) {
            send('reservation', { items: newReservations, count: newReservations.length });
          }
          if (newEnquiries.length > 0) {
            send('enquiry', { items: newEnquiries, count: newEnquiries.length });
          }
          if (newReviews.length > 0) {
            send('review', { items: newReviews, count: newReviews.length });
          }
        } catch {
          // DB error — don't crash the stream, just skip this poll
        }
      }, POLL_INTERVAL_MS);

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        clearInterval(poll);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
