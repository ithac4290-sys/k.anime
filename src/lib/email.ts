import { Resend } from 'resend';

// Resend client initialization
const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL = 
  process.env.RESEND_FROM_EMAIL || 'Animeko <onboarding@resend.dev>';

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  from?: string;
} & (
  | { html: string; text?: string }
  | { text: string; html?: string }
);

/**
 * Umumiy email yuborish funksiyasi
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, from = DEFAULT_FROM_EMAIL } = options;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY aniqlanmadi, email yuborilmadi.');
    return { success: false, error: 'RESEND_API_KEY sozlanmagan' };
  }

  try {
    const client = resend || new Resend(process.env.RESEND_API_KEY);
    
    const emailPayload = 'html' in options && options.html
      ? {
          from,
          to,
          subject,
          html: options.html,
          ...(options.text ? { text: options.text } : {})
        }
      : {
          from,
          to,
          subject,
          text: 'text' in options && options.text ? options.text : ''
        };

    const { data, error } = await client.emails.send(emailPayload);

    if (error) {
      console.error('[Resend] Email yuborishda xatolik:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Noma\'lum xatolik';
    console.error('[Resend] Xatolik:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Yangi ro'yxatdan o'tgan foydalanuvchiga xush kelibsiz xati yuborish
 */
export async function sendWelcomeEmail(toEmail: string, username: string) {
  const subject = "Animeko.uz platformasiga xush kelibsiz! 🎌";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0f1117; color: #f3f4f6; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937;">
      <div style="background: linear-gradient(135deg, #e11d48, #9333ea); padding: 36px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ANIMEKO</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">O'zbek tilidagi eng sevimli manga & anime portali</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px;">Salom, <span style="color: #f43f5e;">${username}</span>! 👋</h2>
        <p style="margin: 0 0 16px 0; color: #9ca3af; line-height: 1.6; font-size: 15px;">
          Animeko oilasiga xush kelibsiz! Endi siz eng sara mangalarni o'zbek tilida qulay va tezkor formatda mutolaa qilishingiz, sevimli boblaringizni xatcho'plarga saqlashingiz va muhokamalarda qatnashishingiz mumkin.
        </p>
        
        <div style="background-color: #1a1e29; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #2d3748;">
          <h3 style="margin: 0 0 12px 0; color: #e5e7eb; font-size: 15px; font-weight: 600;">Siz uchun mavjud imkoniyatlar:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
            <li>⚡ Sevimli mangalarni onlayn o'qish</li>
            <li>⭐ Xatcho'plar (Bookmarks) to'plamini shakllantirish</li>
            <li>💬 Har bir bob ostida izoh qoldirish va fikr almashish</li>
            <li>🎯 Reyting tizimi orqali baholash</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="https://k.animovie.uz" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
            Mutolaani boshlash 🚀
          </a>
        </div>
      </div>
      
      <div style="border-top: 1px solid #1f2937; padding: 20px 24px; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">Agar siz ushbu hisobni yaratmagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
        <p style="margin: 6px 0 0 0;">© ${new Date().getFullYear()} Animeko. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text: `Salom, ${username}! Animeko.uz platformasiga xush kelibsiz!`
  });
}
