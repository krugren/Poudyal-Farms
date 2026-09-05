import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── Admin Route Protection ──────────────────────────────────────────────────
  // Returns a real 404 so bots and URL scanners see nothing at /admin.
  if (pathname.startsWith('/admin')) {
    const hasAdminAccess = request.cookies.get('pf_admin_access');
    if (!hasAdminAccess) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  const response = NextResponse.next();

  // ── Security Headers (applied to every response) ───────────────────────────
  response.headers.set('X-Content-Type-Options',  'nosniff');
  response.headers.set('X-Frame-Options',          'DENY');
  response.headers.set('X-XSS-Protection',         '1; mode=block');
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('X-DNS-Prefetch-Control',    'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src  'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src   'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src    'self' https://fonts.gstatic.com",
    "img-src     'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com",
    "connect-src 'self'",
    "frame-src   https://www.google.com https://maps.google.com",
    "base-uri    'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // ── API Route Hardening ─────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'sliding-window');
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/admin/')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma',        'no-cache');
    }
  }

  // ── Admin Pages: no search engine indexing ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
