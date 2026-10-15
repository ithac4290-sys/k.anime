'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Send, Mail, Lock, User, Eye, EyeOff, 
  LogIn, UserPlus, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TelegramLoginWidget from './TelegramLoginWidget';


declare global {
  interface Window {
    Telegram?: any;
  }
}

interface AuthPageLayoutProps {
  initialMode?: 'login' | 'register';
}

const MANGA_COVERS = [
  { title: "Yolg'izlikda daraja ko'tarish", cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80" },
  { title: "Qilich qiroli", cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80" },
  { title: "Gertsogning kenja o'g'li", cover: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&auto=format&fit=crop&q=80" },
  { title: "Urush mabudining qaytishi", cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
  { title: "O'yinda vaxshiy sifatida", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
  { title: "Qilich ustasining kenja o'g'li", cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" },
  { title: "Chegara bilmas sehrgar", cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80" },
  { title: "Ilohiy iblis yuksalishi", cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80" },
  { title: "Valhalla hikoyasi", cover: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80" },
  { title: "Hua tog'i klanining qaytishi", cover: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&auto=format&fit=crop&q=80" },
  { title: "Dastlabki binafsha chaqmoq", cover: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80" },
  { title: "Sehrli Jang", cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80" }
];

export default function AuthPageLayout({ initialMode = 'login' }: AuthPageLayoutProps) {
  const router = useRouter();
  const { user, login, register, refreshUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showManualForm, setShowManualForm] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect home
  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err === 'google_not_configured') {
        setError("Google orqali kirish uchun GOOGLE_CLIENT_ID sozlanishi kerak.");
      } else if (err === 'google_oauth_failed') {
        setError("Google orqali kirishda xatolik yuz berdi.");
      } else if (err === 'telegram_not_configured') {
        setError("Telegram orqali kirish uchun TELEGRAM_BOT_TOKEN sozlanishi kerak.");
      } else if (err === 'telegram_oauth_failed' || err === 'telegram_invalid_hash') {
        setError("Telegram orqali avtorizatsiyadan o‘tib bo‘lmadi.");
      } else if (err === 'telegram_expired') {
        setError("Telegram avtorizatsiya vaqti tugagan. Qaytadan urinib ko‘ring.");
      }
    }
  }, []);

  const handleGoogleAuth = () => {
    setSubmitting(true);
    setError(null);
    window.location.href = '/api/auth/google';
  };

  const handleTelegramAuth = () => {
    setSubmitting(true);
    setError(null);
    window.location.href = '/api/auth/telegram';
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      if (!username || !password) {
        setError("Iltimos, login va parolni kiriting");
        return;
      }
      setSubmitting(true);
      const res = await login(username, password);
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || "Login yoki parol noto'g'ri");
      } else {
        router.push('/');
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setError("Barcha maydonlarni to'ldiring");
        return;
      }
      if (password !== confirmPassword) {
        setError("Parollar mos emas");
        return;
      }
      if (password.length < 6) {
        setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        return;
      }
      setSubmitting(true);
      const res = await register(username, email, password);
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      } else {
        router.push('/');
      }
    }
  };

  // Duplicate arrays for seamless infinite scroll loop
  const col1 = [...MANGA_COVERS, ...MANGA_COVERS];
  const col2 = [...MANGA_COVERS.slice(4), ...MANGA_COVERS.slice(0, 4), ...MANGA_COVERS, ...MANGA_COVERS];
  const col3 = [...MANGA_COVERS.slice(8), ...MANGA_COVERS.slice(0, 8), ...MANGA_COVERS, ...MANGA_COVERS];

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d] text-white flex overflow-hidden">
      
      {/* LEFT COLUMN: Login / Register Form (Matching Screenshot) */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-12 relative z-20 bg-[#090a0f] bg-grid-pattern">
        
        {/* Top: Back Button */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14151e] hover:bg-[#1c1e2b] border border-[#232636] hover:border-red-500/40 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span>Orqaga</span>
          </button>
        </div>

        {/* Center: Brand & Actions matching Screenshot */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 text-center space-y-6">
          
          {/* Logo with Glowing Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-black mb-4 flex items-center justify-center">
              <img
                src="/animeko-logo.jpg"
                alt="AnimeKO.uz"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Titles matching Screenshot */}
            <h2 className="text-sm sm:text-base font-black tracking-widest uppercase text-red-500">
              ANIMEKO.UZ
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mt-1">
              XUSH KELIBSIZ
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xs mx-auto">
              O‘qishni boshlash uchun kiring yoki hisob yarating.
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Primary Action 1: Telegram orqali kirish (Official Telegram Login Widget) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl bg-[#141622]/80 border border-[#23273a] shadow-inner">
              <TelegramLoginWidget
                botName="KOD_E_bot"
                authUrl="https://k.animovie.uz/auth/telegram/callback"
                size="large"
                radius={14}
              />
            </div>


            {/* Divider: YOKI */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-[#1d202e] w-full" />
              <span className="bg-[#090a0f] px-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                YOKI
              </span>
              <div className="border-t border-[#1d202e] w-full" />
            </div>

            {/* Primary Action 2: Google hisobingiz bilan kiring (Matching Screenshot) */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={submitting}
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-gray-100 text-gray-900 shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google hisobingiz bilan kiring</span>
            </button>
          </div>

          {/* Toggle Manual Email / Password form */}
          <div className="pt-2">
            {!showManualForm ? (
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
              >
                Login va parol orqali kirish / ro‘yxatdan o‘tish
              </button>
            ) : (
              <div className="space-y-4 pt-3 text-left animate-in fade-in duration-200">
                {/* Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#141622] rounded-xl border border-[#212537]">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === 'login' ? 'bg-red-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    Kirish
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === 'register' ? 'bg-red-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    Ro‘yxatdan o‘tish
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={mode === 'login' ? "Login yoki Email" : "Foydalanuvchi nomi"}
                    className="w-full bg-[#141624] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  {mode === 'register' && (
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email manzil"
                      className="w-full bg-[#141624] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  )}
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parol"
                    className="w-full bg-[#141624] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  {mode === 'register' && (
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Parolni qayta kiriting"
                      className="w-full bg-[#141624] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-md transition-all cursor-pointer"
                  >
                    {mode === 'login' ? "Hisobga kirish" : "Ro‘yxatdan o‘tish"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Subtitle note matching Screenshot */}
          <p className="text-[11px] text-gray-500 leading-relaxed pt-3">
            Tugmani bosing — xavfsiz va tezkor tarzda avtomatik kirasiz yoki hisob yaratasiz.
          </p>

        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-gray-600 pt-4">
          © 2026 AnimeKO.uz — Anime &amp; Manga olami. Barcha huquqlar himoyalangan.
        </div>

      </div>

      {/* RIGHT COLUMN: 3D Slanted Animated Manga Wall (Matching Screenshot) */}
      <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-[#06070a]">
        
        {/* Soft edge blend gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#06070a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#06070a] to-transparent z-10 pointer-events-none" />

        {/* Tilted / Slanted 3D Grid */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex gap-5 transform -rotate-12 scale-125 origin-center w-[160%]">
            
            {/* Column 1: Upward scrolling */}
            <div className="flex-1 flex flex-col gap-4 animate-scroll-up">
              {col1.map((item, idx) => (
                <div 
                  key={`col1-${idx}`} 
                  className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-black group relative"
                >
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-black text-white line-clamp-1">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Downward scrolling */}
            <div className="flex-1 flex flex-col gap-4 animate-scroll-down">
              {col2.map((item, idx) => (
                <div 
                  key={`col2-${idx}`} 
                  className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-black group relative"
                >
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-black text-white line-clamp-1">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: Upward scrolling slow */}
            <div className="flex-1 flex flex-col gap-4 animate-scroll-up-slow">
              {col3.map((item, idx) => (
                <div 
                  key={`col3-${idx}`} 
                  className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-black group relative"
                >
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-black text-white line-clamp-1">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
