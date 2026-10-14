import { NextRequest, NextResponse } from 'next/server';
import { validateSession, addCoinsToUser, updateUserPassword, updateUserSubscription } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('animeko_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const user = validateSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Sessiya eskirgan" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'topup') {
      const amount = Number(body.amount) || 1000;
      const res = addCoinsToUser(user.id, amount);
      return NextResponse.json({ success: true, coins: res.coins, message: `${amount} AK-Coin balansingizga qo'shildi!` });
    }

    if (action === 'subscribe') {
      const plan = body.plan || 'vip';
      updateUserSubscription(user.id, plan);
      return NextResponse.json({ success: true, subscription: plan, message: "VIP Obuna muvaffaqiyatli faollashtirildi!" });
    }

    if (action === 'change_password') {
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: "Eski va yangi parolni kiriting" }, { status: 400 });
      }
      const res = updateUserPassword(user.id, oldPassword, newPassword);
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Parol o'zgartirishda xatolik" }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi!" });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (err) {
    console.error('Profile action error:', err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
