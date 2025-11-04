import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes (allow without authentication)
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // API routes that should allow public access
  const publicApiRoutes = ['/api/auth', '/api/teacher/signup'];
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route));

  // If not logged in and not on public route/api, redirect to login
  if (!isLoggedIn && !isPublicRoute && !isPublicApi) {
    const loginUrl = new URL('/', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (isLoggedIn) {
    const userRole = req.auth?.user?.role;

    // Teacher routes
    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Student routes
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Dashboard routes (both can access)
    if (pathname.startsWith('/dashboard') && userRole !== 'TEACHER' && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
