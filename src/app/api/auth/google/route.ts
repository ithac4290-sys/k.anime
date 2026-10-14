import { NextRequest, NextResponse } from 'next/server';
import { loginOrRegisterGoogleUser } from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // If real Google Client ID is configured, redirect to Google OAuth
  if (clientId && clientId !== 'your_google_client_id_here') {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Otherwise, handle instant development Google sign-in
  const { user, sessionId } = loginOrRegisterGoogleUser({
    googleId: 'google_user_' + Date.now().toString().slice(-6),
    email: 'user' + Math.floor(Math.random() * 900 + 100) + '@gmail.com',
    name: 'Google Foydalanuvchisi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('animeko_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || `google_user_${Math.floor(Math.random() * 9000 + 1000)}@gmail.com`;
    const name = body.name || 'Google Foydalanuvchisi';
    const googleId = body.googleId || 'google_' + Date.now();
    const avatarUrl = body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

    const { user, sessionId } = loginOrRegisterGoogleUser({
      googleId,
      email,
      name,
      avatarUrl
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: "Google orqali muvaffaqiyatli kirdingiz!"
    });

    response.cookies.set('animeko_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (err) {
    console.error('Google auth error:', err);
    return NextResponse.json({ error: "Google orqali kirishda xatolik yuz berdi" }, { status: 500 });
  }
}
