import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { ensureAuthTables } from '@/lib/auth-service';

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

    // If bot token is configured, verify HMAC signature from Telegram
    if (botToken) {
      const { hash, ...checkData } = data;
      const dataCheckString = Object.keys(checkData)
        .sort()
        .map((k) => `${k}=${checkData[k]}`)
        .join('\n');

      const secretKey = crypto.createHash('sha256').update(botToken).digest();
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (calculatedHash !== hash) {
        return NextResponse.json(
          { error: "Telegram ma'lumotlari haqiqiyligi tasdiqlanmadi" },
          { status: 403 }
        );
      }
    }

    // Extract real Telegram user details
    const telegramId = String(data.id);
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const tgUsername = data.username;
    const displayName = (firstName + ' ' + lastName).trim() || tgUsername || `tg_${telegramId}`;
    const avatarUrl = data.photo_url || '/animeko-logo.png';
    const email = tgUsername ? `${tgUsername.toLowerCase()}@telegram.org` : `tg_${telegramId}@telegram.org`;

    ensureAuthTables();
    const db = getDb();

    // Check if user exists by telegramId or email
    let user = db.prepare(`
      SELECT * FROM users WHERE google_id = ? OR email = ?
    `).get(`tg_${telegramId}`, email) as any;

    if (!user) {
      // Create new user with real Telegram details
      const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, avatar_url, role, google_id)
        VALUES (?, ?, ?, ?, 'user', ?)
      `).run(
        displayName,
        email,
        'telegram_oauth_account',
        avatarUrl,
        `tg_${telegramId}`
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    } else {
      // Update avatar if provided
      if (avatarUrl && avatarUrl !== '/animeko-logo.png') {
        db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
        user.avatar_url = avatarUrl;
      }
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(sessionId, user.id, expiresAt);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at
      },
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
