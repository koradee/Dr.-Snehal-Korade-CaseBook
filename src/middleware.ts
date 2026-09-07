import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/session';

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  // Allow Next.js internal paths and static assets
  const isNextInternal =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/');

  if (isPublic || isNextInternal) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = verifyToken(token);
  if (!payload) {
    // Token invalid or expired — clear cookie and redirect
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Attach user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.sub);
  requestHeaders.set('x-username', payload.username);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
