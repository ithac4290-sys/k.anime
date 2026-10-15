'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Manga } from '@/types';
import MangaCard from './MangaCard';

interface MangaSectionRowProps {
  title: string;
  mangas: Manga[];
  allLink?: string;
}

export default function MangaSectionRow({ title, mangas, allLink = '/catalog' }: MangaSectionRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!mangas || mangas.length === 0) {
    return null;
  }

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-3.5 relative group">
      {/* Section Header matching screenshot */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-red-600 rounded-full inline-block" />
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        </div>
        <Link
          href={allLink}
          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
        >
          Barchasi
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards Row */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-1"
        >
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>

        {/* Right Slider Arrow button matching screenshot */}
        {mangas.length > 5 && (
          <button
            onClick={scrollNext}
            className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/85 hover:bg-black border border-red-500/60 hover:border-red-500 text-red-400 hover:text-white items-center justify-center shadow-lg shadow-red-600/30 backdrop-blur-md transition-all hover:scale-110 z-10"
            aria-label="Keyingisi"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
