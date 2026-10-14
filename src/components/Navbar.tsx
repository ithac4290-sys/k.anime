'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Search, LogIn, UserPlus, 
  Dices, Menu, X, Bookmark, ShieldCheck, Command,
  LogOut, ChevronDown, User as UserIcon
} from 'lucide-react';
import SearchModal from './SearchModal';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isHome = pathname === '/';
  const isCatalog = pathname.startsWith('/catalog');

  return (
    <header className="sticky top-0 z-50 bg-[#0e0f14]/95 backdrop-blur-md border-b border-[#1f212c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            {/* AnimeKO.uz Logo matching user visual identity */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-105 group-hover:ring-red-400 transition-all bg-black shrink-0">
                <img
                  src="/animeko-logo.jpg"
                  alt="AnimeKO.uz"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-xl sm:text-2xl font-black italic tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-sans">
                    Anime<span className="text-red-500 not-italic font-black ml-0.5 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">KO</span>
                  </span>
                  <span className="text-xs font-extrabold text-zinc-400 ml-0.5">.uz</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-[1.5px] w-2.5 bg-red-500 rounded-full" />
                  <span className="text-[9px] tracking-wider uppercase text-zinc-300 font-semibold leading-none">
                    Anime &amp; Manga olami
                  </span>
                  <span className="h-[1.5px] w-2.5 bg-red-500 rounded-full" />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links matching screenshot */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isHome
                    ? 'bg-[#291316] text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#181a24]'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-red-500" />
                Bosh sahifa
              </Link>

              <Link
                href="/catalog"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isCatalog
                    ? 'bg-[#291316] text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#181a24]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                Katalog
              </Link>

              <Link
                href="/api/random"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#181a24] flex items-center gap-1.5 transition-all"
                title="Tasodifiy manga ochish"
              >
                <Dices className="w-3.5 h-3.5 text-red-400" />
                Tasodifiy
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar matching screenshot */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-2">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="w-full bg-[#15161f] hover:bg-[#1a1b26] border border-[#232533] hover:border-red-500/40 rounded-xl px-4 py-2 text-xs text-gray-400 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 font-medium">Anime, manga, manhva qidirish...</span>
              </div>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1e202c] text-[10px] font-mono text-gray-400 border border-[#2b2e3e]">
                <Command className="w-3 h-3 inline" /> K
              </span>
            </button>
          </div>

          {/* Right: Actions (Kirish & Ro'yxatdan o'tish or User Menu) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/bookmarks"
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#181a24] transition-colors"
              title="Xatcho‘plar"
            >
              <Bookmark className="w-4 h-4 text-red-400" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#141620] hover:bg-[#1b1d2a] border border-[#232739] hover:border-red-500/40 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs ring-1 ring-red-500/50">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-red-400 font-semibold leading-none capitalize">
                      {user.role === 'admin' ? 'Admin' : user.role === 'translator' ? 'Tarjimon' : 'A’zo'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-[#12141c] border border-[#222638] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#1d202e]">
                      <p className="text-xs font-bold text-white truncate">{user.username}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#181a24] transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-red-400" />
                      Mening profilim
                    </Link>


                    {(user.role === 'admin' || user.role === 'translator') && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#181a24] font-semibold transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Paneli
                      </Link>
                    )}

                    <div className="my-1 border-t border-[#1d202e]" />

                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#181a24] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-gray-400" />
                  Kirish
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Ro‘yxatdan o‘tish
                </Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#181a24]"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#181a24]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1f212c] space-y-3">
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setSearchModalOpen(true); }}
              className="w-full bg-[#15161f] border border-[#232533] rounded-xl px-4 py-2.5 text-xs text-gray-400 flex items-center gap-2.5"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>Anime, manga, manhva qidirish...</span>
            </button>

            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-[#181a24] flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-red-500" /> Bosh sahifa
              </Link>
              <Link
                href="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-[#181a24] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-gray-400" /> Katalog
              </Link>
              <Link
                href="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-[#181a24] flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-red-400" /> Xatcho‘plar
              </Link>
              <Link
                href="/api/random"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-200 hover:bg-[#181a24] flex items-center gap-2"
              >
                <Dices className="w-4 h-4 text-red-400" /> Tasodifiy manga
              </Link>

              {user ? (
                <div className="pt-2 border-t border-[#1f212c] space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl bg-[#161824] hover:bg-[#1f2233] flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs ring-1 ring-red-500/40">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {user.username}
                        <span className="text-[10px] text-red-400 font-normal">→ Profil</span>
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </Link>

                  {(user.role === 'admin' || user.role === 'translator') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-[#181a24] flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-red-500" /> Admin Paneli
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/20 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Chiqish
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#1f212c] grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl text-xs font-semibold text-gray-200 bg-[#161824] border border-[#242738] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-gray-400" /> Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Ro‘yxatdan o‘tish
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
}
