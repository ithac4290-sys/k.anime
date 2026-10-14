import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('animeko_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const user = validateSession(sessionId);
    return NextResponse.json({ user });
  } catch (err) {
    console.error('Session validation error:', err);
    return NextResponse.json({ user: null });
  }
}
