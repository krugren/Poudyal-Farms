import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const POLL_INTERVAL_MS = 10000; // Check every 10 seconds
const HEARTBEAT_MS     = 25000; // Keep-alive ping every 25s

export async function GET(request) {
  // Record time at connection — only stream reviews newer than this
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

      // Confirm connection
      send('connected', { ts: connectedAt.toISOString() });

      // Heartbeat — prevents proxy / browser from closing idle connection
      const heartbeat = setInterval(() => {
        if (closed) { clearInterval(heartbeat); return; }
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          closed = true;
          clearInterval(heartbeat);
        }
      }, HEARTBEAT_MS);

      // Poll for new visible reviews
      const poll = setInterval(async () => {
        if (closed) { clearInterval(poll); return; }
        try {
          const newReviews = await prisma.feedback.findMany({
            where: {
              createdAt:  { gt: connectedAt },
              isVisible:  true,
            },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, name: true, rating: true,
              comment: true, avatarColor: true,
              createdAt: true, source: true,
            },
          });

          if (newReviews.length > 0) {
            send('new_review', { reviews: newReviews });
          }
        } catch {
          // DB hiccup — skip this tick, keep stream alive
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
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
