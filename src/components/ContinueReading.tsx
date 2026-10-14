'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, History, ArrowRight } from 'lucide-react';
import { ReadingHistoryItem } from '@/types';

export default function ContinueReading() {
  const [lastRead, setLastRead] = useState<ReadingHistoryItem | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mangauz_history');
      if (stored) {
        const history: ReadingHistoryItem[] = JSON.parse(stored);
        if (history.length > 0) {
          setLastRead(history[0]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!lastRead) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950/40 via-[#131726] to-[#121624] border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow">
          <img
            src={lastRead.cover_url}
            alt={lastRead.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider mb-0.5">
            <History className="w-3.5 h-3.5" />
            <span>O‘qishda davom etish</span>
          </div>
          <h4 className="font-bold text-white text-sm line-clamp-1">
            {lastRead.title}
          </h4>
          <p className="text-xs text-gray-400">
            Siz {lastRead.chapter_number}-bobda to‘xtagansiz
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Link
          href={`/manga/${lastRead.slug}`}
          className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 transition-colors"
        >
          Manga sahifasi
        </Link>
        <Link
          href={`/manga/${lastRead.slug}/read/${lastRead.chapter_number}`}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Davom ettirish ({lastRead.chapter_number}-bob)
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
