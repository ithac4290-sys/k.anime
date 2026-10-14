import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: "Login va parolni kiriting" },
        { status: 400 }
      );
    }

    const result = authenticateUser(login, password);
    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error || "Login yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = createSession(result.user.id);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Tizimga muvaffaqiyatli kirdingiz!"
    });

    response.cookies.set('animeko_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
