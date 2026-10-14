'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Manga } from '@/types';

interface MangaCardProps {
  manga: Manga;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mangauz_bookmarks');
      if (stored) {
        const list: Manga[] = JSON.parse(stored);
        setIsFavorite(list.some((item) => item.id === manga.id));
      }
    } catch {
      // ignore
    }
  }, [manga.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('mangauz_bookmarks');
      let list: Manga[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        list = list.filter((item) => item.id !== manga.id);
        setIsFavorite(false);
      } else {
        list.push(manga);
        setIsFavorite(true);
      }
      localStorage.setItem('mangauz_bookmarks', JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  return (
    <div className="group flex flex-col bg-[#13141b] hover:bg-[#181a24] border border-[#202330] hover:border-red-500/50 rounded-2xl p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-600/10">
      
      {/* Poster Image with Top Badges matching screenshot */}
      <Link href={`/manga/${manga.slug}`} className="relative aspect-[3/4] rounded-xl overflow-hidden block bg-[#181a26] mb-3">
        <img
          src={manga.cover_url}
          alt={manga.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top-left: Star Rating Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-red-400 font-bold text-xs border border-white/10 shadow-sm">
          <Star className="w-3 h-3 fill-red-500 text-red-500" />
          <span>{manga.rating ? manga.rating.toFixed(1) : '4.8'}</span>
        </div>

        {/* Top-right: Heart Button matching screenshot */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
              : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/80 border border-white/10'
          }`}
          title={isFavorite ? "Saqlangan" : "Sevimliga qo‘shish"}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Bottom chapter pill (if any) */}
        {manga.latest_chapter && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600/90 text-white shadow">
              {manga.latest_chapter.chapter_number}-bob
            </span>
          </div>
        )}
      </Link>

      {/* Info beneath poster matching screenshot */}
      <div className="px-1 flex-1 flex flex-col justify-between space-y-2">
        <Link href={`/manga/${manga.slug}`}>
          <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
            {manga.title}
          </h3>
        </Link>

        {/* Bottom row: Type & Year */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-[#1c1e2a]">
          <span className="capitalize font-medium text-gray-400">
            {manga.type === 'manhwa' ? 'Manhva' : manga.type === 'manhua' ? 'Manxua' : 'Manga'}
          </span>
          <span>{manga.release_year || '2024'}</span>
        </div>
      </div>

    </div>
  );
}
