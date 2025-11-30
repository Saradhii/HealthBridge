import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/signin', '/signup'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/about', '/contact'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  // Try to get auth data from localStorage via cookie approach
  // Note: We can't directly access localStorage in middleware,
  // but we can check if there's a persistent storage indicator

  // For now, we'll rely on client-side protection
  // This middleware mainly handles redirects for auth pages

  if (isAuthRoute) {
    // If user tries to access signin/signup while potentially authenticated,
    // they'll be redirected by client-side logic
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    // Protected routes are handled by AuthenticatedLayout on client-side
    // This allows proper hydration and token validation
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
