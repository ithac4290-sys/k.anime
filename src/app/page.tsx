import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getAllManga } from '@/lib/manga-service';
import FeaturedHero from '@/components/FeaturedHero';
import MangaSectionRow from '@/components/MangaSectionRow';
import LatestChaptersSection from '@/components/LatestChaptersSection';

export const instant = false;

export default async function HomePage() {
  const { mangas: popularMangas } = getAllManga({ sort: 'views', limit: 6 });
  const { mangas: newMangas } = getAllManga({ sort: 'latest', limit: 6 });
  const { mangas: recommendedMangas } = getAllManga({ sort: 'rating', limit: 6 });

  const featuredList = popularMangas.slice(0, 5);
  const hasMangas = popularMangas.length > 0 || newMangas.length > 0;

  return (
    <div className="space-y-8 pb-8">
      {/* 0. AnimeKO.uz Brand Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-950/40 via-[#12131b] to-[#12131b] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.12)]">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.45)] shrink-0 bg-black">
            <img
              src="/animeko-logo.jpg"
              alt="AnimeKO.uz"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black italic text-white tracking-tight font-sans">
                Anime<span className="text-red-500 not-italic">KO</span><span className="text-xs text-zinc-400 font-bold ml-0.5">.uz</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/25 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Rasmiy Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5 flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Eng sara anime, manga va manhvalar o‘zbek tilida yuqori sifatda!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="https://t.me/K_Animovie_UZ"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all hover:scale-102 flex items-center gap-2"
          >
            Telegram kanalimiz
          </a>
        </div>
      </div>

      {!hasMangas ? (
        <div className="py-20 px-4 text-center rounded-3xl border border-[#20222e] bg-[#111218]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-bold text-white">Hozircha mangalar mavjud emas</h3>
            <p className="text-sm text-gray-400">
              Admin panel orqali yangi mangalar qo‘shilganda bu yerda avtomatik paydo bo‘ladi.
            </p>
          </div>
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/25"
          >
            Admin Panelga o‘tish
          </Link>
        </div>
      ) : (
        <>
          {/* 1. Top Hero Carousel */}
          <FeaturedHero featured={featuredList} />

          {/* 2. Section: | Mashhur */}
          <MangaSectionRow
            title="Mashhur"
            mangas={popularMangas}
            allLink="/catalog?sort=views"
          />

          {/* 3. Section: | Yangi */}
          <MangaSectionRow
            title="Yangi"
            mangas={newMangas}
            allLink="/catalog?sort=latest"
          />

          {/* 4. Section: | So'nggi boblar */}
          <LatestChaptersSection />

          {/* 5. Section: | Tavsiya etilgan */}
          <MangaSectionRow
            title="Tavsiya etilgan"
            mangas={recommendedMangas}
            allLink="/catalog?sort=rating"
          />
        </>
      )}
    </div>
  );
}
