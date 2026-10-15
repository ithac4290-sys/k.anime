import React from 'react';
import { getMangasBySlugs, getAllManga } from '@/lib/manga-service';
import FeaturedHero from '@/components/FeaturedHero';
import MangaSectionRow from '@/components/MangaSectionRow';
import LatestChaptersSection from '@/components/LatestChaptersSection';

export const instant = false;

export default async function HomePage() {
  // Ordered exact titles matching Screenshot 1: Mashhur
  const popularSlugs = [
    'qilich-qiroli',
    'solo-leveling',
    'gertsogning-kenja-ogli',
    'qilich-ustasining-kenja-ogli',
    'chegara-bilmas-sehrgar',
    'beginning-after-the-end'
  ];

  // Ordered exact titles matching Screenshot 2: Yangi
  const newSlugs = [
    'ilohiy-iblis-yuksalishi',
    'yakkaxon-oyin-imperatori',
    'valhalla-hikoyasi',
    'urush-mabudining-qaytishi',
    'oyinda-vaxshiy-sifatida-omon-qolish',
    'dangasa-hukmdor-solnomalari'
  ];

  // Ordered exact titles matching Screenshot 3: Tavsiya etilgan
  const recommendedSlugs = [
    'hua-togi-klanining-qaytishi',
    'dastlabki-binafsha-chaqmoq',
    'kelajakka-10000-yillik-sayohat',
    'mening-xotinim-iblis-qirolichasi',
    'sss-darajali-oyinchining-qaytishi',
    'oyinchi-player'
  ];

  const popularMangas = getMangasBySlugs(popularSlugs);
  const newMangas = getMangasBySlugs(newSlugs);
  const recommendedMangas = getMangasBySlugs(recommendedSlugs);

  // If any fallback needed, fetch all
  const { mangas: allFallback } = getAllManga({ limit: 12 });
  const finalPopular = popularMangas.length > 0 ? popularMangas : allFallback.slice(0, 6);
  const finalNew = newMangas.length > 0 ? newMangas : allFallback.slice(6, 12);
  const finalRecommended = recommendedMangas.length > 0 ? recommendedMangas : allFallback.slice(0, 6);

  // Featured hero list with "Yolg'izlikda daraja ko'tarish" first as in Screenshot 1
  const soloLeveling = popularMangas.find(m => m.slug === 'solo-leveling') || finalPopular[1] || finalPopular[0];
  const qilichQiroli = popularMangas.find(m => m.slug === 'qilich-qiroli') || finalPopular[0];
  const featuredList = [soloLeveling, qilichQiroli, ...finalPopular.slice(2, 5)];

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

      {/* 1. Top Hero Carousel matching Screenshot 1 */}
      <FeaturedHero featured={featuredList} />

      {/* 2. Section: | Mashhur matching Screenshot 1 */}
      <MangaSectionRow
        title="Mashhur"
        mangas={finalPopular}
        allLink="/catalog?sort=views"
      />

      {/* 3. Section: | Yangi matching Screenshot 2 */}
      <MangaSectionRow
        title="Yangi"
        mangas={finalNew}
        allLink="/catalog?sort=latest"
      />

      {/* 4. Section: | So'nggi boblar matching Screenshot 2 */}
      <LatestChaptersSection />

      {/* 5. Section: | Tavsiya etilgan matching Screenshot 3 */}
      <MangaSectionRow
        title="Tavsiya etilgan"
        mangas={finalRecommended}
        allLink="/catalog?sort=rating"
      />
    </div>
  );
}
