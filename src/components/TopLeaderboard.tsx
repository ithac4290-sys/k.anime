import React from 'react';
import Link from 'next/link';
import { Trophy, Star, Eye, Flame } from 'lucide-react';
import { Manga } from '@/types';

interface TopLeaderboardProps {
  mangas: Manga[];
}

export default function TopLeaderboard({ mangas }: TopLeaderboardProps) {
  const top10 = mangas.slice(0, 10);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-300 to-gray-100 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-slate-300/30">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-amber-700/30">
            3
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-xl bg-[#1a2133] text-gray-400 font-bold text-xs flex items-center justify-center border border-[#27314d]">
            {rank}
          </span>
        );
    }
  };

  return (
    <section className="bg-[#101420] border border-[#1e2538] rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1c2236] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Top Reyting Mangalar
              <Flame className="w-4 h-4 text-rose-500 inline fill-rose-500" />
            </h2>
            <p className="text-xs text-gray-400">Kitobxonlar ko‘rishlari va baholari bo‘yicha peshqadamlar</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {top10.map((manga, idx) => (
          <Link
            key={manga.id}
            href={`/manga/${manga.slug}`}
            className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#141826] hover:bg-[#1a2135] border border-[#20273c] hover:border-amber-500/40 transition-all"
          >
            {getRankBadge(idx + 1)}

            <img
              src={manga.cover_url}
              alt={manga.title}
              className="w-12 h-16 object-cover rounded-xl border border-[#28324a] shrink-0 group-hover:scale-105 transition-transform"
            />

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {manga.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {manga.rating ? manga.rating.toFixed(1) : '4.8'}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  {manga.views.toLocaleString()}
                </span>
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#1e2538] text-gray-300">
                  {manga.type}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
