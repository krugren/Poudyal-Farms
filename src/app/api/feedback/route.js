import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

const AVATAR_COLORS = ['#d4a843', '#87a7b3', '#c17d4a', '#6b8f5e', '#a0522d', '#5f7a8a', '#8b6f47', '#5a8a6b', '#b8860b', '#7a9a7e'];

// ── In-memory rate limiter ─────────────────────────────────────────────────
// Allows MAX_SUBMISSIONS per IP within WINDOW_MS (rolling window).
// The Map is module-level so it persists across requests in the same process.
// Pruning on every check keeps memory bounded (no unbounded growth).
const RATE_MAP = new Map();        // ip → [timestamp, ...]
const WINDOW_MS        = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS  = 3;

function isRateLimited(ip) {
  const now  = Date.now();
  const hits = (RATE_MAP.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_SUBMISSIONS) return true;
  RATE_MAP.set(ip, [...hits, now]);
  return false;
}

// Derive client IP from the headers Next.js sets (works behind Vercel/Nginx).
function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ── Gibberish detection ──
// Language-agnostic: checks structural patterns of spam/bots, not vocabulary.
// Works for any script (Devanagari, Latin, Chinese, Arabic, Tibetan, etc.)

function hasRepeatingPattern(str) {
  // Detect long runs of same char: "aaaaaa", "12121212"
  if (/(.)\1{4,}/.test(str)) return true;
  // Detect simple repeating 2-char pattern: "ababab" (3+ repetitions)
  if (/^(.{1,3})\1{3,}$/.test(str)) return true;
  return false;
}

function isKeyboardMash(str) {
  // Only meaningful for Latin-script text (a-z, A-Z)
  const latinOnly = str.replace(/[^a-zA-Z]/g, '');
  if (latinOnly.length < 6) return false; // Not enough Latin chars to judge

  const lower = latinOnly.toLowerCase();

  // Ratio of vowels in Latin text
  const vowels = (lower.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowels / lower.length;
  // Less than 10% vowels in a long Latin string = likely mash
  if (lower.length >= 8 && vowelRatio < 0.10) return true;

  // Detect excessive consecutive consonants (8+ = almost certainly mash)
  if (/[^aeiou\s]{8,}/i.test(lower)) return true;

  // Detect sequential keyboard row patterns (e.g. "qwerty", "asdfgh")
  const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  for (const row of keyboardRows) {
    const reversed = row.split('').reverse().join('');
    for (let len = 6; len <= Math.min(lower.length, 10); len++) {
      for (let i = 0; i <= lower.length - len; i++) {
        const sub = lower.slice(i, i + len);
        if (row.includes(sub) || reversed.includes(sub)) return true;
      }
    }
  }
  return false;
}

function isGibberish(str) {
  const trimmed = str.trim();
  if (!trimmed) return true;

  // Pure numbers/symbols only — no human-readable content
  if (/^[\d\s\W]+$/.test(trimmed)) return true;

  // Repeating pattern (language-neutral)
  if (hasRepeatingPattern(trimmed)) return true;

  // Keyboard mash (Latin only — non-Latin scripts are trusted as-is)
  if (isKeyboardMash(trimmed)) return true;

  // URLs/emails submitted as feedback text
  if (/https?:\/\/|www\./i.test(trimmed)) return true;

  return false;
}

function validateFeedback(name, comment) {
  if (isGibberish(name)) {
    return 'Please enter your real name.';
  }
  if (isGibberish(comment)) {
    return 'Your comment doesn\'t look like a genuine review. Please share your real experience.';
  }
  // Latin-script comments should contain at least 2 words
  const hasLatin = /[a-zA-Z]/.test(comment);
  if (hasLatin) {
    const wordCount = comment.trim().split(/\s+/).filter(w => w.length > 1).length;
    if (wordCount < 2) {
      return 'Please write at least a short sentence about your experience.';
    }
  }
  return null; // valid
}

// POST /api/feedback — Submit feedback (public)
export async function POST(request) {
  try {
    // Rate limit — checked before reading body to fail fast
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'You have submitted too many reviews recently. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, rating, comment, website } = body;

    // Honeypot
    if (website) return NextResponse.json({ success: true, message: 'Thank you!' });

    const cleanName = sanitize(name, 100);
    const cleanComment = sanitize(comment, 1000);

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Name must be 2-100 characters' }, { status: 400 });

    const ratingNum = parseFloat(rating);
    // Accept whole stars (1-5) or half-stars (1.5, 2.5 … 4.5) only
    const validRating = !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5 && Math.round(ratingNum * 2) === ratingNum * 2;
    if (!validRating) return NextResponse.json({ error: 'Rating must be between 1 and 5 in 0.5 increments' }, { status: 400 });

    if (!cleanComment || cleanComment.length < 5) return NextResponse.json({ error: 'Comment must be at least 5 characters' }, { status: 400 });

    // Gibberish / spam validation
    const validationError = validateFeedback(cleanName, cleanComment);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const feedback = await prisma.feedback.create({
      data: {
        name: cleanName,
        rating: ratingNum,
        comment: cleanComment,
        avatarColor,
      },
    });

    return NextResponse.json({ success: true, message: 'Thank you for your feedback!', feedback }, { status: 201 });
  } catch (err) {
    console.error('Feedback error:', err);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

// GET /api/feedback — List feedback (public: visible only, admin: all with ?all=true)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const showAll = searchParams.get('all') === 'true';

    // If requesting all feedback (admin), token must be present AND valid.
    // A missing/invalid token returns 401 — no silent fallback to public data.
    let isAdmin = false;
    if (showAll) {
      const { requireAuth } = await import('@/lib/auth');
      const auth = requireAuth(request);
      if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      isAdmin = true;
    }

    const where = isAdmin ? {} : { isVisible: true };

    const [total, feedback, statsResult] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, rating: true, comment: true,
          avatarColor: true, createdAt: true, source: true, authorPhoto: true,
          ...(isAdmin ? { isVisible: true } : {}),
        },
      }),
      prisma.feedback.aggregate({
        where: { isVisible: true },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    // Rating distribution (always based on visible only)
    const distribution = await prisma.feedback.groupBy({
      by: ['rating'],
      where: { isVisible: true },
      _count: true,
    });

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      // Round float ratings (e.g. 4.5 → 5, 3.5 → 4) into integer buckets
      const bucket = Math.min(5, Math.max(1, Math.round(d.rating)));
      ratingDist[bucket] = (ratingDist[bucket] || 0) + d._count;
    }

    const stats = {
      total_reviews: statsResult._count,
      average_rating: statsResult._avg.rating ? parseFloat(statsResult._avg.rating.toFixed(1)) : 0,
      distribution: ratingDist,
    };

    return NextResponse.json({
      feedback,
      stats,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Feedback list error:', err);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
