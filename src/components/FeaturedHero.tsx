'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Star, Eye, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Manga } from '@/types';

interface FeaturedHeroProps {
  featured: Manga[];
}

export default function FeaturedHero({ featured }: FeaturedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!featured || featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured]);

  if (!featured || featured.length === 0) return null;

  const current = featured[currentIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#20222e] bg-[#111218] min-h-[380px] sm:min-h-[420px] flex items-center mb-10 shadow-2xl">
      {/* Background with blur and dark gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.cover_url}
          alt={current.title}
          className="w-full h-full object-cover object-center filter blur-2xl scale-125 opacity-25 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e13] via-[#0d0e13]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e13] via-transparent to-transparent" />
      </div>

      {/* Main Content matching TopManga screenshot */}
      <div className="relative z-10 p-6 sm:p-12 w-full flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Info */}
        <div className="flex-1 space-y-4 max-w-xl text-left">
          {/* "Eng mashhur" badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            <span>Eng mashhur</span>
          </div>

          {/* Title */}
          <Link href={`/manga/${current.slug}`} className="block group">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight group-hover:text-red-400 transition-colors leading-tight line-clamp-2">
              {current.title}
            </h1>
          </Link>

          {/* Meta line: Type | Views | Rating */}
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-1">
            <span className="capitalize px-2 py-0.5 rounded bg-[#1c1e28] text-gray-300 border border-[#282a38]">
              {current.type === 'manhwa' ? 'Manhva' : current.type === 'manhua' ? 'Manxua' : 'Manga'}
            </span>

            <span className="flex items-center gap-1.5 text-gray-300">
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              {current.views.toLocaleString()} ko‘rishlar
            </span>

            <span className="flex items-center gap-1 text-red-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              {current.rating ? current.rating.toFixed(1) : '4.8'}
            </span>
          </div>

          {/* Quick action button */}
          <div className="pt-3">
            <Link
              href={`/manga/${current.slug}/read/1`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/35 transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              O‘qishni boshlash
            </Link>
          </div>

          {/* Carousel dots at bottom left matching screenshot */}
          <div className="flex items-center gap-2 pt-6">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-7 bg-red-500 shadow-md shadow-red-500/50' 
                    : 'w-2 bg-gray-700 hover:bg-gray-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Featured Poster Card with Glowing Red Border */}
        <div className="relative shrink-0 w-52 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.45)] group">
          <Link href={`/manga/${current.slug}`} className="block w-full h-full">
            <img
              src={current.cover_url}
              alt={current.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
          </Link>

          {/* Next / Prev buttons on the poster */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Oldingi"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featured.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Keyingi"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
