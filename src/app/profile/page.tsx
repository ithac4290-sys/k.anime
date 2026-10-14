'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Calendar, Heart, Lock, 
  ArrowRight, CheckCircle2, AlertCircle, X, Camera, LogOut, BookOpen, Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Manga } from '@/types';

export default function ProfilePage() {
  const { user, openAuthModal, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState<Manga[]>([]);

  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mangauz_bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Yangi parollar mos kelmadi");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPasswordError(data.error || "Parolni o'zgartirishda xatolik");
      } else {
        setPasswordSuccess("Parolingiz muvaffaqiyatli yangilandi!");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordSuccess(null);
        }, 1500);
      }
    } catch {
      setPasswordError("Tarmoq xatosi");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const removeBookmark = (id: number) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('mangauz_bookmarks', JSON.stringify(updated));
  };

  const formatRegDate = (dateStr?: string) => {
    if (!dateStr) return '6 Oktabr 2026';
    try {
      const d = new Date(dateStr);
      const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-2">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Shaxsiy Profil</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          Xatcho‘plaringiz va profil sozlamalarini ko‘rish uchun tizimga kiring.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          Kirish yoki Ro‘yxatdan o‘tish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* 1. Top User Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-[#17141a] via-[#12131b] to-[#12131b] p-6 sm:p-8 shadow-[0_0_35px_rgba(239,68,68,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Avatar & Info */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-red-500/80 shadow-lg shadow-red-500/30 bg-zinc-900 flex items-center justify-center">
                {user.avatar_url && user.avatar_url !== '/animeko-logo.jpg' ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-3xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md border-2 border-[#12131b] hover:scale-110 transition-transform cursor-pointer"
                title="Rasmni yangilash"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/25 text-red-400 border border-red-500/35 uppercase tracking-wider">
                  {user.role === 'admin' ? 'Administrator' : user.role === 'translator' ? 'Tarjimon' : 'A’zo'}
                </span>
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>{user.email}</span>
              </p>

              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>Ro‘yxatdan o‘tgan: {formatRegDate(user.created_at)}</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sevimli Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-[#171924] border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span>{bookmarks.length} Sevimli</span>
            </div>

            {/* Parolni o'zgartirish Button */}
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Parolni o‘zgartirish</span>
            </button>

            {/* Chiqish Button */}
            <button
              type="button"
              onClick={() => logout()}
              className="px-3.5 py-2 rounded-xl bg-[#181b28] hover:bg-rose-950/40 border border-[#272b3c] hover:border-rose-500/40 text-gray-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Sevimlilar (Saved Manga) Section */}
      <div className="rounded-2xl border border-[#1f212d] bg-[#12131b] p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#1f212d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sevimlilar ro‘yxati</h2>
              <p className="text-xs text-gray-400">Siz saqlagan va o‘qishni rejalashtirgan mangalar ({bookmarks.length})</p>
            </div>
          </div>

          <Link
            href="/catalog"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookmarks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500/60 mb-1">
              <Heart className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Hozircha sevimlilar mavjud emas</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Manga sahifasidagi yurakcha tugmasini bosib, yoqtirgan asarlaringizni bu yerda saqlab borishingiz mumkin.
            </p>
            <Link
              href="/catalog"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-102 flex items-center gap-2 mt-2"
            >
              <span>Katalogga o‘tish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Bookmarks grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bookmarks.map((manga) => (
              <div 
                key={manga.id} 
                className="group relative rounded-xl overflow-hidden bg-[#161824] border border-[#232739] hover:border-red-500/50 transition-all shadow-md flex flex-col"
              >
                <Link href={`/manga/${manga.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-black/40">
                  <img 
                    src={manga.cover_url} 
                    alt={manga.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-red-400" />
                      O‘qish
                    </span>
                  </div>
                </Link>
                
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <Link 
                    href={`/manga/${manga.slug}`} 
                    className="text-xs font-bold text-white hover:text-red-400 line-clamp-1 transition-colors"
                  >
                    {manga.title}
                  </Link>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1f2233]">
                    <span className="text-[10px] text-gray-400 font-medium capitalize">
                      {manga.type || 'Manga'}
                    </span>
                    <button
                      onClick={() => removeBookmark(manga.id)}
                      className="text-gray-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-rose-950/30 cursor-pointer"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Parolni o'zgartirish */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#12141c] border border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1d29] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Parolni o‘zgartirish</h3>
                <p className="text-xs text-gray-400">Hisobingiz xavfsizligini ta'minlang</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Joriy parol</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Hozirgi parolingizni kiriting"
                  className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Yangi parol</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Yangi parolni tasdiqlash</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yangi parolni qayta kiriting"
                  className="w-full bg-[#161824] border border-[#23273a] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {passwordSubmitting ? 'O‘zgartirilmoqda...' : 'Parolni yangilash'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
