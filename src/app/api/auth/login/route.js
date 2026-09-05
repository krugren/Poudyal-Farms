import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

// Brute-force protection — max 10 login attempts per IP per 15 minutes.
const LOGIN_MAP     = new Map();
const LOGIN_WINDOW  = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX     = 10;

function isLoginRateLimited(ip) {
  const now  = Date.now();
  const hits = (LOGIN_MAP.get(ip) || []).filter(t => now - t < LOGIN_WINDOW);
  if (hits.length >= LOGIN_MAX) return true;
  LOGIN_MAP.set(ip, [...hits, now]);
  return false;
}

function getIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request) {
  const ip = getIp(request);
  if (isLoginRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Sanitize input
    const cleanUsername = String(username).trim().slice(0, 50);

    const admin = await prisma.admin.findUnique({ where: { username: cleanUsername } });

    if (!admin || !comparePassword(password, admin.passwordHash)) {
      // Generic error — don't reveal whether username or password was wrong
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: admin.id, username: admin.username, role: 'admin' });

    return NextResponse.json({
      success: true,
      token,
      user: { username: admin.username },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
