import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  const isConfigured = !!process.env.RESEND_API_KEY;
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured 
      ? "Resend API kaliti muvaffaqiyatli ulangan!" 
      : "RESEND_API_KEY belgilanmagan"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Qabul qiluvchi email manzilini (to) kiriting" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: subject || "Animeko - Resend Test Xabari",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e11d48;">Animeko Resend Ulanishi Muvaffaqiyatli! ✅</h2>
          <p>${message || "Ushbu xat Resend API orqali sinov tariqasida yuborildi."}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #888;">Yuborilgan vaqt: ${new Date().toLocaleString()}</small>
        </div>
      `,
      text: message || "Ushbu xat Resend API orqali sinov tariqasida yuborildi."
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Email yuborishda xatolik" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email muvaffaqiyatli yuborildi!",
      data: result.data
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Noma\'lum xatolik';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
