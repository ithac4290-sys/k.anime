'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Heart } from 'lucide-react';
import { Manga } from '@/types';

interface BookmarkButtonProps {
  manga: Manga;
  iconOnly?: boolean;
}

export default function BookmarkButton({ manga, iconOnly = false }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mangauz_bookmarks');
      if (stored) {
        const list: Manga[] = JSON.parse(stored);
        setIsBookmarked(list.some((item) => item.id === manga.id));
      }
    } catch {
      // ignore
    }
  }, [manga.id]);

  const toggleBookmark = () => {
    try {
      const stored = localStorage.getItem('mangauz_bookmarks');
      let list: Manga[] = stored ? JSON.parse(stored) : [];

      if (isBookmarked) {
        list = list.filter((item) => item.id !== manga.id);
        setIsBookmarked(false);
      } else {
        list.push(manga);
        setIsBookmarked(true);
      }
      localStorage.setItem('mangauz_bookmarks', JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={toggleBookmark}
        title={isBookmarked ? "Xatcho‘plardan o‘chirish" : "Xatcho‘pga qo‘shish"}
        className={`p-3.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
          isBookmarked
            ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-md shadow-red-500/20'
            : 'bg-[#151722] hover:bg-[#1c1f2e] text-gray-300 border-[#262838] hover:border-red-500/40'
        }`}
      >
        <Heart
          className={`w-5 h-5 transition-transform active:scale-125 ${
            isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-white'
          }`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggleBookmark}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
        isBookmarked
          ? 'bg-red-600/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10'
          : 'bg-[#181d2c] hover:bg-[#20273b] text-gray-300 border-[#2b354d]'
      }`}
    >
      <Bookmark
        className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`}
      />
      {isBookmarked ? "Saqlangan" : "Xatcho‘pga qo‘shish"}
    </button>
  );
}
