import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSession } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Barcha maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    const result = registerUser(username, email, password);
    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error || "Ro'yxatdan o'tishda xatolik yuz berdi" },
        { status: 400 }
      );
    }

    // Create session
    const sessionId = createSession(result.user.id);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!"
    });

    // Set cookie
    response.cookies.set('animeko_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
