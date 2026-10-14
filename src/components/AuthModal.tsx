'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register, refreshUser } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError(null);
      setSuccess(null);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isAuthModalOpen, authModalMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.user) {
        await refreshUser();
        closeAuthModal();
      } else {
        window.location.href = '/api/auth/google';
      }
    } catch {
      window.location.href = '/api/auth/google';
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isLogin) {
      if (!username || !password) {
        setError("Iltimos, login va parolni kiriting");
        return;
      }

      setSubmitting(true);
      const res = await login(username, password);
      setSubmitting(false);

      if (!res.success) {
        setError(res.error || "Login yoki parol noto'g'ri");
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setError("Barcha maydonlarni to'ldiring");
        return;
      }

      if (password !== confirmPassword) {
        setError("Parollar bir xil emas");
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
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div 
        className="w-full max-w-md bg-[#11131b] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1d29] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-red-500 shadow-lg shadow-red-500/30 bg-black shrink-0 mb-3">
            <img
              src="/animeko-logo.jpg"
              alt="AnimeKO.uz"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-black italic tracking-tight text-white font-sans">
              Anime<span className="text-red-500 not-italic font-black ml-0.5">KO</span>
            </span>
            <span className="text-xs font-bold text-zinc-400 ml-0.5">.uz</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-[1px] w-2.5 bg-red-500 rounded-full" />
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
              Anime &amp; Manga olami
            </span>
            <span className="h-[1px] w-2.5 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#161823] rounded-2xl border border-[#222638] mb-6">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isLogin
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Kirish
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              !isLogin
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Ro‘yxatdan o‘tish
          </button>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#181a26] hover:bg-[#202334] border border-[#272b3e] hover:border-red-500/50 text-white shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group mb-4"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google orqali {isLogin ? 'kirish' : "ro‘yxatdan o‘tish"}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[#1f2231] w-full" />
          <span className="bg-[#11131b] px-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold shrink-0">
            yoki email orqali
          </span>
          <div className="border-t border-[#1f2231] w-full" />
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Login Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              {isLogin ? "Foydalanuvchi nomi yoki Email" : "Foydalanuvchi nomi"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? "masalan: naruto yoki admin" : "masalan: sasuke_uchiha"}
                className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email Input (Register only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">
                Email manzil
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nomingiz@mail.com"
                  className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white shadow-lg shadow-red-600/35 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Hisobga kirish</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Ro‘yxatdan o‘tishni yakunlash</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-gray-400">
          {isLogin ? (
            <p>
              Profilingiz yo‘qmi?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
              >
                Ro‘yxatdan o‘tish
              </button>
            </p>
          ) : (
            <p>
              Profilingiz bormi?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
              >
                Kirish
              </button>
            </p>
          )}
        </div>

        {/* Hint for test credentials */}
        {isLogin && (
          <div className="mt-4 pt-3 border-t border-[#1d202e] text-center text-[10px] text-gray-500">
            <span>Admin sinov hisobi: </span>
            <span className="text-gray-300 font-mono">admin</span> / <span className="text-gray-300 font-mono">admin123</span>
          </div>
        )}
      </div>
    </div>
  );
}
