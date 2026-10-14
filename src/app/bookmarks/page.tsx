'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, History, Trash2, BookOpen, Play, Clock } from 'lucide-react';
import { Manga, ReadingHistoryItem } from '@/types';
import MangaCard from '@/components/MangaCard';

export default function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Manga[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('mangauz_bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }

      const storedHistory = localStorage.getItem('mangauz_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  const clearAllBookmarks = () => {
    if (confirm("Haqiqatan ham barcha saqlangan xatcho'plarni o'chirmoqchimisiz?")) {
      localStorage.removeItem('mangauz_bookmarks');
      setBookmarks([]);
    }
  };

  const clearHistory = () => {
    if (confirm("Haqiqatan ham o'qish tarixini tozalamoqchimisiz?")) {
      localStorage.removeItem('mangauz_history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1d2336] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Shaxsiy Kutubxona</h1>
          <p className="text-sm text-gray-400 mt-1">
            Saqlangan mangalaringiz va oxirgi o‘qish tarixingiz
          </p>
        </div>

        {activeTab === 'bookmarks' && bookmarks.length > 0 && (
          <button
            onClick={clearAllBookmarks}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xatcho‘plarni tozalash
          </button>
        )}

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tarixni tozalash
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#21273b] gap-2">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 fill-amber-400" />
          Xatcho‘plar ({bookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          O‘qish tarixi ({history.length})
        </button>
      </div>

      {!loaded ? (
        <div className="text-center py-20 text-gray-500">Yuklanmoqda...</div>
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {bookmarks.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#101420] border border-[#1e2538] rounded-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Xatcho‘plar bo‘sh</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Sizga yoqqan mangalarni saqlash uchun ularning sahifasidagi &ldquo;Xatcho‘pga qo‘shish&rdquo; tugmasini bosing.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Katalogga o‘tish
            </Link>
          </div>
        )
      ) : (
        /* History Tab */
        history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.manga_id}
                className="p-4 rounded-2xl bg-[#121624] border border-[#20273c] hover:border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className="w-14 h-20 object-cover rounded-xl border border-[#273047] shrink-0"
                  />
                  <div className="space-y-1">
                    <Link href={`/manga/${item.slug}`} className="font-bold text-white hover:text-rose-400 text-sm">
                      {item.title}
                    </Link>
                    <p className="text-xs text-rose-400 font-semibold">
                      To‘xtalgan: {item.chapter_number}-bob
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.updated_at).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/manga/${item.slug}`}
                    className="px-3 py-2 rounded-xl bg-[#171b29] hover:bg-[#20263b] text-gray-300 text-xs font-semibold border border-[#272f47]"
                  >
                    Manga sahifasi
                  </Link>
                  <Link
                    href={`/manga/${item.slug}/read/${item.chapter_number}`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    O‘qishni davom ettirish
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#101420] border border-[#1e2538] rounded-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">O‘qish tarixi mavjud emas</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Birorta manga bobini o‘qishni boshlashingiz bilan ushbu bo‘limda avtomatik saqlanib boradi.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
