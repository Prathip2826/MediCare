import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { token, uid, action } = await req.json();

  if (action === 'logout') {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', '', { 
      path: '/', 
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return response;
  }

  // We'll store the UID in the cookie for this prototype to match with Supabase profiles
  const sessionToken = uid || token;

  if (!sessionToken) {
    return NextResponse.json({ error: 'No token or UID provided' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-token', sessionToken, { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return response;
}
