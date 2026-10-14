import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('animeko_session')?.value;
    if (sessionId) {
      deleteSession(sessionId);
    }

    const response = NextResponse.json({ success: true, message: "Tizimdan chiqildi" });
    response.cookies.delete('animeko_session');
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
