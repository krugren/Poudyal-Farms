import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────
// POST /api/admin/google-reviews/import
//
// Free workaround — no paid API needed.
// How to get your reviews:
//   1. Go to https://business.google.com
//   2. Open your Poudyal Farm listing → Reviews tab
//   3. Copy the reviewer name, rating, date, and text
//   4. Paste into the admin UI (or POST here as JSON array)
//
// Payload format:
// {
//   reviews: [
//     {
//       googleReviewId: "unique-string-per-review",  // use reviewer name + date
//       name: "Reviewer Name",
//       rating: 5,
//       comment: "Great place!",
//       authorPhoto: "https://...",   // optional Google profile photo URL
//       createdAt: "2024-03-15T10:00:00Z"  // ISO timestamp from Google
//     }
//   ]
// }
// ─────────────────────────────────────────────────────────────

const GOOGLE_AVATAR_COLORS = [
  '#4285F4', // Google blue
  '#34A853', // Google green
  '#FBBC05', // Google yellow
  '#EA4335', // Google red
  '#5F6368', // Google grey
  '#1A73E8',
  '#0F9D58',
  '#F4B400',
];

export async function POST(request) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviews } = body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: 'reviews array is required' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const r of reviews) {
      // Build a stable googleReviewId from name + timestamp if not provided
      const gid = r.googleReviewId || `google_${r.name}_${r.createdAt || Date.now()}`;

      // Skip duplicate check
      const existing = await prisma.feedback.findUnique({
        where: { googleReviewId: gid },
      });

      if (existing) {
        skipped++;
        continue;
      }

      if (!r.name || !r.rating || !r.comment) {
        errors.push(`Missing fields for review by: ${r.name || 'unknown'}`);
        continue;
      }

      const ratingNum = parseInt(r.rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        errors.push(`Invalid rating for: ${r.name}`);
        continue;
      }

      const avatarColor = GOOGLE_AVATAR_COLORS[
        Math.abs(r.name.charCodeAt(0)) % GOOGLE_AVATAR_COLORS.length
      ];

      await prisma.feedback.create({
        data: {
          name: r.name,
          rating: ratingNum,
          comment: r.comment,
          avatarColor,
          isVisible: true,
          source: 'google',
          googleReviewId: gid,
          authorPhoto: r.authorPhoto || null,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.length ? errors : undefined,
      message: `Imported ${imported} review(s). ${skipped} already existed.`,
    });
  } catch (err) {
    console.error('Google review import error:', err);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}

// GET — return import stats
export async function GET(request) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [total, googleCount, localCount] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { source: 'google' } }),
    prisma.feedback.count({ where: { source: 'local' } }),
  ]);

  return NextResponse.json({ total, googleCount, localCount });
}
