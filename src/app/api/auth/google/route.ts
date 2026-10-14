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

  // If not configured, do not create a fake user — redirect back with clear error
  return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.email || !body.googleId) {
      return NextResponse.json(
        { error: "Haqiqiy Google hisob ma'lumotlari kiritilishi shart (email va ID)" },
        { status: 400 }
      );
    }

    const { email, name, googleId, avatarUrl } = body;

    const { user, sessionId } = loginOrRegisterGoogleUser({
      googleId,
      email: email.trim().toLowerCase(),
      name: (name || email.split('@')[0]).trim(),
      avatarUrl: avatarUrl || '/animeko-logo.png'
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: "Google hisobingiz orqali muvaffaqiyatli kirdingiz!"
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
