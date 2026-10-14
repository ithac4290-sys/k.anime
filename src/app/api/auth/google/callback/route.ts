import { NextRequest, NextResponse } from 'next/server';
import { loginOrRegisterGoogleUser } from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(new URL('/?error=google_failed', request.url));
  }

  // If real Google OAuth is configured, exchange code for tokens
  if (clientId && clientSecret && clientId !== 'your_google_client_id_here') {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return NextResponse.redirect(new URL('/?error=google_token_failed', request.url));
      }

      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const googleProfile = await userRes.json();

      const { user, sessionId } = loginOrRegisterGoogleUser({
        googleId: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name || googleProfile.given_name || 'Google User',
        avatarUrl: googleProfile.picture
      });

      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set('animeko_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60
      });
      return response;
    } catch (err) {
      console.error('Google callback error:', err);
      return NextResponse.redirect(new URL('/?error=google_oauth_error', request.url));
    }
  }

  // Fallback demo user
  const { user, sessionId } = loginOrRegisterGoogleUser({
    googleId: 'google_user_' + Date.now().toString().slice(-6),
    email: 'google.user@gmail.com',
    name: 'Google Foydalanuvchisi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('animeko_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60
  });
  return response;
}
