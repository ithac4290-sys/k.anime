'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  ArrowLeft, ListFilter, Sliders, ChevronDown, 
  Play, Pause, Sun, Moon, Printer, Palette, Download
} from 'lucide-react';
import { ChapterPage, Manga, Chapter, ReadingHistoryItem } from '@/types';
import LoadingScreen from './LoadingScreen';

interface ReaderViewerProps {
  manga: Manga;
  chapter: Chapter;
  pages: ChapterPage[];
  prevChapterNumber: number | null;
  nextChapterNumber: number | null;
  allChapters: { id: number; chapter_number: number; title: string | null }[];
}

export default function ReaderViewer({
  manga,
  chapter,
  pages,
  prevChapterNumber,
  nextChapterNumber,
  allChapters
}: ReaderViewerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'webtoon' | 'single'>('webtoon');
  const [currentPage, setCurrentPage] = useState(1);
  const [maxWidth, setMaxWidth] = useState<'normal' | 'wide' | 'full'>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [readProgress, setReadProgress] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'black' | 'sepia'>('dark');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [chapter.chapter_number]);

  const getBgThemeClass = () => {
    switch (theme) {
      case 'black': return 'bg-black text-gray-200';
      case 'sepia': return 'bg-[#181512] text-[#fef3c7]';
      default: return 'bg-[#07080c] text-gray-100';
    }
  };

  // Save to Reading History
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('mangauz_history');
      let history: ReadingHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];
      history = history.filter((h) => h.manga_id !== manga.id);
      history.unshift({
        manga_id: manga.id,
        slug: manga.slug,
        title: manga.title,
        cover_url: manga.cover_url,
        chapter_number: chapter.chapter_number,
        total_chapters: allChapters.length,
        updated_at: new Date().toISOString()
      });
      // keep last 20
      localStorage.setItem('mangauz_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [manga, chapter, allChapters.length]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setReadProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll loop
  useEffect(() => {
    if (!autoScroll || mode !== 'webtoon') return;
    const interval = setInterval(() => {
      window.scrollBy({ top: scrollSpeed * 2, behavior: 'smooth' });
    }, 40);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed, mode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'd') {
          if (currentPage < pages.length) {
            setCurrentPage((p) => p + 1);
          } else if (nextChapterNumber !== null) {
            router.push(`/manga/${manga.slug}/read/${nextChapterNumber}`);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
          if (currentPage > 1) {
            setCurrentPage((p) => p - 1);
          } else if (prevChapterNumber !== null) {
            router.push(`/manga/${manga.slug}/read/${prevChapterNumber}`);
          }
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setAutoScroll((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentPage, pages.length, nextChapterNumber, prevChapterNumber, manga.slug, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'wide': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-2xl';
    }
  };

  if (loading) {
    return <LoadingScreen text="Sahifa yuklanmoqda..." fullScreen={true} />;
  }

  return (
    <div className={`min-h-screen ${getBgThemeClass()} -mx-4 sm:-mx-6 lg:-mx-8 -my-6 flex flex-col relative select-none transition-colors duration-300`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 transition-all duration-150 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
          style={{ width: mode === 'webtoon' ? `${readProgress}%` : `${(currentPage / pages.length) * 100}%` }}
        />
      </div>

      {/* Top sticky control bar */}
      <div className="sticky top-0 z-40 bg-[#0d0f17]/95 backdrop-blur-md border-b border-[#1c2236] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/manga/${manga.slug}`}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors"
            title="Mangaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-0.5">
            <Link href={`/manga/${manga.slug}`} className="text-xs font-semibold text-gray-400 hover:text-white line-clamp-1">
              {manga.title}
            </Link>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{chapter.chapter_number}-bob</span>
              {chapter.title && <span className="text-gray-400 font-normal"> - {chapter.title}</span>}
            </h2>
          </div>
        </div>

        {/* Center / Chapter Selector Dropdown */}
        <div className="hidden sm:flex items-center gap-2">
          {prevChapterNumber !== null ? (
            <Link
              href={`/manga/${manga.slug}/read/${prevChapterNumber}`}
              className="p-2 rounded-lg bg-[#171b29] hover:bg-rose-600 text-gray-200 hover:text-white transition-colors"
              title="Oldingi bob"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-2 rounded-lg bg-[#141724] text-gray-600 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </span>
          )}

          <div className="relative">
            <select
              value={chapter.chapter_number}
              onChange={(e) => {
                setLoading(true);
                router.push(`/manga/${manga.slug}/read/${e.target.value}`);
              }}
              className="bg-[#171b29] border border-[#242b40] rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-200 appearance-none pr-8 cursor-pointer hover:border-red-500 focus:outline-none"
            >
              {allChapters.map((ch) => (
                <option key={ch.id} value={ch.chapter_number}>
                  {ch.chapter_number}-bob {ch.title ? `(${ch.title})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {nextChapterNumber !== null ? (
            <Link
              href={`/manga/${manga.slug}/read/${nextChapterNumber}`}
              onClick={() => setLoading(true)}
              className="p-2 rounded-lg bg-[#171b29] hover:bg-red-600 text-gray-200 hover:text-white transition-colors"
              title="Keyingi bob"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-2 rounded-lg bg-[#141724] text-gray-600 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Right Settings */}
        <div className="flex items-center gap-2">
          {/* Auto-scroll button for Webtoon */}
          {mode === 'webtoon' && (
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                autoScroll ? 'bg-amber-500 text-black font-bold animate-pulse' : 'bg-[#171b29] text-gray-300 hover:text-white'
              }`}
              title="Avto-scroll (Probeldan boshqarish mumkin)"
            >
              {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Avto</span>
            </button>
          )}

          {/* Mode switch */}
          <div className="flex rounded-xl bg-[#151926] p-1 border border-[#21273b]">
            <button
              onClick={() => { setMode('webtoon'); setAutoScroll(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'webtoon' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Vebtun
            </button>
            <button
              onClick={() => { setMode('single'); setAutoScroll(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'single' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sahifa
            </button>
          </div>

          {/* Theme palette toggle */}
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'black' : t === 'black' ? 'sepia' : 'dark'))}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors"
            title={`Mavzu: ${theme === 'dark' ? 'Standart Tun' : theme === 'black' ? 'OLED Qora' : 'Sepiya (Qog‘oz)'}`}
          >
            <Palette className={`w-4 h-4 ${theme === 'sepia' ? 'text-amber-400' : 'text-rose-400'}`} />
          </button>

          {/* Print / Save to PDF */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors hidden sm:block"
            title="PDF sifatida chop etish / saqlash"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Brightness toggle */}
          <button
            onClick={() => setBrightness((b) => (b === 100 ? 80 : b === 80 ? 60 : 100))}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors"
            title={`Yorug'lik: ${brightness}%`}
          >
            {brightness < 100 ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Width adjustment button */}
          <button
            onClick={() => setMaxWidth((prev) => (prev === 'normal' ? 'wide' : prev === 'wide' ? 'full' : 'normal'))}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors hidden md:block"
            title={`Kenglik: ${maxWidth}`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#171b29] hover:bg-[#22283d] text-gray-300 hover:text-white transition-colors"
            title="To‘liq ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pages Container with Brightness Filter */}
      <div 
        className="flex-1 flex flex-col items-center justify-center py-6 px-2 transition-all duration-300"
        style={{ filter: `brightness(${brightness}%)` }}
      >
        {pages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Ushbu bob uchun sahifalar kiritilmagan.</p>
          </div>
        ) : mode === 'webtoon' ? (
          /* Webtoon vertical scroll mode */
          <div className={`w-full ${getMaxWidthClass()} flex flex-col items-center gap-0 shadow-2xl`}>
            {pages.map((p) => (
              <div key={p.id} className="relative w-full overflow-hidden bg-black flex justify-center">
                <img
                  src={p.image_url}
                  alt={`Sahifa ${p.page_number}`}
                  className="w-full h-auto block select-none pointer-events-none"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Single page navigation mode */
          <div className={`w-full ${getMaxWidthClass()} flex flex-col items-center gap-4`}>
            <div className="relative w-full rounded-2xl overflow-hidden bg-black flex justify-center shadow-2xl border border-[#1b2030]">
              <img
                src={pages[currentPage - 1]?.image_url}
                alt={`Sahifa ${currentPage}`}
                className="w-full h-auto max-h-[85vh] object-contain select-none"
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between w-full max-w-md px-4 py-2 bg-[#121624] border border-[#20273c] rounded-2xl">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-[#1a2033] hover:bg-rose-600 text-white disabled:opacity-40 disabled:hover:bg-[#1a2033] text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Oldingi
              </button>

              <span className="text-xs font-bold text-gray-300">
                {currentPage} / {pages.length}
              </span>

              <button
                disabled={currentPage >= pages.length}
                onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-[#1a2033] hover:bg-rose-600 text-white disabled:opacity-40 disabled:hover:bg-[#1a2033] text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Keyingi <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom chapter navigation bar */}
      <div className="border-t border-[#181d2e] bg-[#0c0e17] py-8 px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        {prevChapterNumber !== null && (
          <Link
            href={`/manga/${manga.slug}/read/${prevChapterNumber}`}
            onClick={() => setLoading(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#161a29] hover:bg-[#20263b] border border-[#262e45] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Oldingi bob ({prevChapterNumber})
          </Link>
        )}

        <Link
          href={`/manga/${manga.slug}`}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ListFilter className="w-4 h-4" />
          Boblar ro‘yxati
        </Link>

        {nextChapterNumber !== null && (
          <Link
            href={`/manga/${manga.slug}/read/${nextChapterNumber}`}
            onClick={() => setLoading(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Keyingi bob ({nextChapterNumber})
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
