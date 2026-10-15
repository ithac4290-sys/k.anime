import { NextRequest, NextResponse } from 'next/server';
import { loginOrRegisterTelegramUser, verifyTelegramAuthData } from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botId = process.env.TELEGRAM_BOT_ID || (botToken ? botToken.split(':')[0] : null);
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const callbackUrl = `${baseUrl}/api/auth/telegram/callback`;

  // If real Bot ID is available, redirect to official Telegram OAuth / OpenID endpoint
  if (botId) {
    const telegramOAuthUrl = new URL('https://oauth.telegram.org/auth');
    telegramOAuthUrl.searchParams.set('bot_id', botId);
    telegramOAuthUrl.searchParams.set('origin', baseUrl);
    telegramOAuthUrl.searchParams.set('embed', '0');
    telegramOAuthUrl.searchParams.set('request_access', 'write');
    telegramOAuthUrl.searchParams.set('return_to', callbackUrl);
    return NextResponse.redirect(telegramOAuthUrl.toString());
  }

  // If not configured, redirect back with descriptive error
  return NextResponse.redirect(new URL('/login?error=telegram_not_configured', request.url));
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json().catch(() => null);

    if (!data || !data.id || !data.hash) {
      return NextResponse.json(
        { error: "Telegram orqali avtorizatsiya ma'lumotlari to‘liq emas" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // If bot token is configured, verify HMAC signature
    if (botToken) {
      const isValid = verifyTelegramAuthData(data, botToken);
      if (!isValid) {
        return NextResponse.json(
          { error: "Telegram ma'lumotlari haqiqiyligi tasdiqlanmadi" },
          { status: 403 }
        );
      }
    }

    const { user, sessionId } = loginOrRegisterTelegramUser({
      telegramId: String(data.id),
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      photoUrl: data.photo_url
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: "Telegram orqali muvaffaqiyatli kirdingiz!"
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
    console.error('Telegram auth error:', err);
    return NextResponse.json(
      { error: "Telegram orqali kirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
