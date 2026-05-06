import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We use Firebase Auth (client-side only). The middleware cannot verify Firebase tokens
// without the Firebase Admin SDK. Instead, we use a lightweight cookie set on login.
// The real auth guard is in the dashboard layout via onAuthStateChanged.

export function middleware(request: NextRequest) {
  // Just pass everything through — auth is handled client-side in layout.tsx
  // This avoids the redirect loop caused by missing cookie while Firebase loads
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
