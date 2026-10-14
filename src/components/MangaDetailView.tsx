'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, BookOpen, Star, Eye, ChevronDown, ChevronUp, 
  LockOpen, MessageSquare, BarChart3, Layers, Calendar, User, ArrowUpDown
} from 'lucide-react';
import { Manga, Chapter } from '@/types';
import BookmarkButton from './BookmarkButton';
import CommentsSection from './CommentsSection';
import RatingWidget from './RatingWidget';

interface MangaDetailViewProps {
  manga: Manga & { chapters: Chapter[] };
}

export default function MangaDetailView({ manga }: MangaDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments' | 'stats'>('chapters');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);

  const chapters = manga.chapters || [];
  const totalChapters = chapters.length;
  const firstChapter = chapters[0];

  // Sort chapters
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortDescending 
      ? b.chapter_number - a.chapter_number 
      : a.chapter_number - b.chapter_number;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '12/20/2025';
    try {
      const d = new Date(dateStr);
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return '12/20/2025';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumbs matching Screenshot 1 */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 py-1 flex-wrap">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Home className="w-3.5 h-3.5 text-red-500" />
          <span>Bosh sahifa</span>
        </Link>
        <span className="text-gray-600">&gt;</span>
        <Link href="/catalog" className="hover:text-white transition-colors">
          Katalog
        </Link>
        <span className="text-gray-600">&gt;</span>
        <span className="text-gray-300 font-medium truncate max-w-sm sm:max-w-md">
          {manga.title}
        </span>
      </nav>

      {/* 2. Main Details Card matching Screenshot 1 */}
      <div className="rounded-2xl border border-[#1f212d] bg-[#12131b] p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Poster + Badges + Action Buttons */}
          <div className="w-full sm:w-64 md:w-60 lg:w-64 shrink-0 mx-auto md:mx-0 flex flex-col items-center">
            {/* Poster with bottom rating & views overlay */}
            <div className="relative w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-[#272a39] shadow-2xl group bg-black">
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              {/* Bottom Badges matching Screenshot 1 */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs shadow-md shadow-red-600/40">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{manga.rating ? manga.rating.toFixed(1) : '4.8'}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-gray-200 text-xs font-semibold border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  <span>{manga.views.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Read Button & Favorite Button matching Screenshot 1 */}
            <div className="flex items-center gap-2.5 pt-4 w-56 sm:w-64">
              <Link
                href={`/manga/${manga.slug}/read/${firstChapter?.chapter_number || 1}`}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-center shadow-lg shadow-red-600/35 transition-all flex items-center justify-center gap-2 hover:scale-102"
              >
                <BookOpen className="w-4 h-4" />
                <span>O‘qish 1 / {totalChapters || 1}</span>
              </Link>
              <BookmarkButton manga={manga} iconOnly={true} />
            </div>
          </div>

          {/* Right Column: Title, Badges, Stats, Genres, Description */}
          <div className="flex-1 space-y-4 text-left w-full">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {manga.title}
            </h1>

            {/* Badges Row: Year, Status, Type, Age limit */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#181a24] text-gray-300 border border-[#242738]">
                {manga.release_year || 2024}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {manga.status === 'completed' ? 'Tugallangan' : 'Davom etmoqda'}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#181a24] text-gray-300 border border-[#242738] capitalize">
                {manga.type === 'manhwa' ? 'Manhva' : manga.type === 'manhua' ? 'Manxua' : 'Manga'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                16+
              </span>
            </div>

            {/* Stats Row: Chapters, Rating (comments), Views */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-300 font-medium py-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{totalChapters} bob</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <Star className="w-4 h-4 fill-red-500 text-red-500" />
                <span>{manga.rating ? manga.rating.toFixed(1) : '4.8'}</span>
                <span className="text-gray-400 font-normal">({manga.rating_count || 2} izoh)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{manga.views.toLocaleString()} ko‘rish</span>
              </div>
            </div>

            {/* Genres Row */}
            {manga.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {manga.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/catalog?genre=${g.slug}`}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-[#171924] hover:bg-[#202333] hover:text-red-400 text-gray-300 border border-[#242738] transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Translator / Team Line */}
            <div className="text-xs text-gray-400 pt-1">
              <span className="text-gray-500">Tarjimon: </span>
              <span className="text-gray-200 font-semibold">{manga.author || 'Manga Complex'}</span>
            </div>

            {/* Description ("Tavsif") matching Screenshot 1 */}
            <div className="pt-2 space-y-2 border-t border-[#1e202c]">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tavsif</h3>
              <div className="relative">
                <p className={`text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line ${
                  !isDescExpanded ? 'line-clamp-2' : ''
                }`}>
                  {manga.description || "Ushbu sarlavha uchun tavsif hozircha kiritilmagan."}
                </p>
                {!isDescExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#12131b] to-transparent pointer-events-none" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors inline-flex items-center gap-1 cursor-pointer pt-0.5"
              >
                {isDescExpanded ? (
                  <>Kamroq <ChevronUp className="w-3.5 h-3.5 inline" /></>
                ) : (
                  <>Batafsil &gt;</>
                )}
              </button>
            </div>

            {/* Interactive Rating Widget */}
            <div className="pt-2">
              <RatingWidget 
                mangaSlug={manga.slug} 
                initialRating={manga.rating} 
                initialCount={manga.rating_count} 
              />
            </div>

          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs matching Screenshot 1 */}
      <div className="flex items-center gap-8 border-b border-[#1f212d] text-sm font-bold pt-2">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'chapters'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Boblar ({totalChapters})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'comments'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Izohlar ({manga.rating_count || 2})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statistika</span>
        </button>
      </div>

      {/* 4. Tab 1 Content: Chapters List matching Screenshot 1 & 2 */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          {/* Header row with sort toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Boblar ro‘yxati</span>
            </h2>

            <button
              onClick={() => setSortDescending(!sortDescending)}
              className="text-xs font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151722] border border-[#232635] transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortDescending ? 'Yangi → Eski ⌵' : 'Eski → Yangi ⌃'}</span>
            </button>
          </div>

          {/* Chapters Table / List */}
          {sortedChapters.length > 0 ? (
            <div className="space-y-1.5">
              {sortedChapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/manga/${manga.slug}/read/${ch.chapter_number}`}
                  className="flex items-center justify-between p-3.5 sm:px-5 rounded-xl bg-[#12141c] hover:bg-[#191b26] border border-[#1e202c] hover:border-red-500/40 transition-all group"
                >
                  {/* Left: Book icon + chapter number */}
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors shrink-0" />
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                      1 - {ch.chapter_number}
                    </span>
                    {ch.title && ch.title !== `${ch.chapter_number}-bob` && (
                      <span className="text-xs text-gray-400 hidden sm:inline truncate max-w-xs">
                        — {ch.title}
                      </span>
                    )}
                  </div>

                  {/* Right: Date + Lock status indicator */}
                  <div className="flex items-center gap-5 sm:gap-8 shrink-0">
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDate(ch.created_at)}
                    </span>
                    <span className="text-emerald-400 hover:text-emerald-300" title="Bepul o‘qish">
                      <LockOpen className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#12141c] border border-[#1e202c] rounded-2xl text-gray-400">
              <p>Hozircha boblar yuklanmagan.</p>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2 Content: Comments */}
      {activeTab === 'comments' && (
        <div className="pt-2">
          <CommentsSection mangaSlug={manga.slug} />
        </div>
      )}

      {/* 6. Tab 3 Content: Stats */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-[#12141c] border border-[#1e202c] space-y-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Jami ko‘rishlar</span>
            <p className="text-2xl font-black text-white">{manga.views.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl bg-[#12141c] border border-[#1e202c] space-y-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">O‘rtacha reyting</span>
            <p className="text-2xl font-black text-red-400">★ {manga.rating ? manga.rating.toFixed(1) : '4.8'}</p>
          </div>
          <div className="p-5 rounded-xl bg-[#12141c] border border-[#1e202c] space-y-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Yuklangan boblar</span>
            <p className="text-2xl font-black text-emerald-400">{totalChapters} ta bob</p>
          </div>
        </div>
      )}

    </div>
  );
}
