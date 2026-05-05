import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/symptoms') ||
                           request.nextUrl.pathname.startsWith('/medicines') ||
                           request.nextUrl.pathname.startsWith('/reports') ||
                           request.nextUrl.pathname.startsWith('/appointments') ||
                           request.nextUrl.pathname.startsWith('/firstaid') ||
                           request.nextUrl.pathname.startsWith('/mental-health') ||
                           request.nextUrl.pathname.startsWith('/chatbot') ||
                           request.nextUrl.pathname.startsWith('/profile');

  if (!authToken && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/symptoms/:path*',
    '/medicines/:path*',
    '/reports/:path*',
    '/appointments/:path*',
    '/firstaid/:path*',
    '/mental-health/:path*',
    '/chatbot/:path*',
    '/profile/:path*'
  ],
};
