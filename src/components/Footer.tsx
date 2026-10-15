import React from 'react';
import Link from 'next/link';
import { Mail, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1c26] mt-16 pt-12 pb-10 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logo & Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-all bg-black shrink-0">
                <img
                  src="/animeko-logo.jpg"
                  alt="AnimeKO.uz"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-xl font-black italic tracking-tight text-white font-sans">
                    Anime<span className="text-red-500 not-italic font-black ml-0.5">KO</span>
                  </span>
                  <span className="text-xs font-bold text-zinc-400 ml-0.5">.uz</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="h-[1.5px] w-3 bg-red-500 rounded-full" />
                  <span className="text-[10px] tracking-wider uppercase text-zinc-300 font-semibold leading-none">
                    Anime &amp; Manga olami
                  </span>
                  <span className="h-[1.5px] w-3 bg-red-500 rounded-full" />
                </div>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Eng sara anime, manga va manhvalarni o‘zbek tilida yuqori sifatda o‘qing va tomosha qiling.
            </p>

            {/* Social Icons row matching screenshot */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#232635] hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1c27] transition-all text-xs"
                title="Facebook"
              >
                f
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#232635] hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1c27] transition-all text-xs"
                title="Twitter"
              >
                𝕏
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#232635] hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1c27] transition-all text-xs"
                title="Instagram"
              >
                📷
              </a>
              {/* Telegram */}
              <a
                href="https://t.me/K_Animovie_UZ"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#232635] hover:border-sky-500/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1c27] transition-all"
                title="Telegram Kanalimiz"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigatsiya */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigatsiya</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-red-400 transition-colors">Bosh sahifa</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-red-400 transition-colors">Katalog</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Janrlar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Janrlar</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalog?genre=action" className="hover:text-red-400 transition-colors">Jang</Link>
              </li>
              <li>
                <Link href="/catalog?genre=romance" className="hover:text-red-400 transition-colors">Romantika</Link>
              </li>
              <li>
                <Link href="/catalog?genre=fantasy" className="hover:text-red-400 transition-colors">Fantaziya</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Aloqa */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aloqa</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <a href="mailto:info@animeko.uz" className="hover:text-white transition-colors">
                  info@animeko.uz
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <a href="https://t.me/K_Animovie_UZ" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Telegram: @K_Animovie_UZ
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-[#181a24] text-center text-[11px] text-gray-500">
          © 2026 AnimeKO.uz — Anime &amp; Manga olami. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
