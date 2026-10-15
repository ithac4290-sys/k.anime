import { NextRequest, NextResponse } from 'next/server';
import { loginOrRegisterTelegramUser, verifyTelegramAuthData } from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');
    const firstName = searchParams.get('first_name') || '';
    const lastName = searchParams.get('last_name') || '';
    const username = searchParams.get('username') || undefined;
    const photoUrl = searchParams.get('photo_url') || undefined;
    const authDate = searchParams.get('auth_date');

    if (!id || !hash) {
      return NextResponse.redirect(new URL('/login?error=telegram_oauth_failed', request.url));
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Verify HMAC signature if bot token is provided
    if (botToken) {
      const data: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        data[key] = value;
      });

      const isValid = verifyTelegramAuthData(data, botToken);
      if (!isValid) {
        return NextResponse.redirect(new URL('/login?error=telegram_invalid_hash', request.url));
      }

      // Check auth_date not older than 1 day
      if (authDate) {
        const authTimestamp = parseInt(authDate, 10);
        const now = Math.floor(Date.now() / 1000);
        if (now - authTimestamp > 86400) {
          return NextResponse.redirect(new URL('/login?error=telegram_expired', request.url));
        }
      }
    }

    // Register or login user
    const { sessionId } = loginOrRegisterTelegramUser({
      telegramId: id,
      firstName,
      lastName,
      username,
      photoUrl
    });

    // Set cookie and redirect to home
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
    console.error('Telegram OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=telegram_oauth_failed', request.url));
  }
}
