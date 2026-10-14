'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { Manga } from '@/types';

interface WeeklyScheduleProps {
  mangas: Manga[];
}

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

export default function WeeklySchedule({ mangas }: WeeklyScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [currentDayName, setCurrentDayName] = useState(DAYS[0]);

  useEffect(() => {
    const now = new Date();
    const dayIndex = (now.getDay() + 6) % 7;
    const today = DAYS[dayIndex];
    setCurrentDayName(today);
    setSelectedDay(today);
  }, []);

  const dayMangas = mangas.filter(
    (m) => m.schedule_day?.toLowerCase() === selectedDay.toLowerCase() || m.status === 'ongoing'
  );

  return (
    <section className="bg-[#101420] border border-[#1e2538] rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2236] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Haftalik Chiqish Jadvali</h2>
            <p className="text-xs text-gray-400">Yangi boblar haftaning qaysi kunlarida chiqishi</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 self-start sm:self-auto">
          Bugun: {currentDayName}
        </span>
      </div>

      {/* Weekday Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = day === selectedDay;
          const isToday = day === currentDayName;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-[#151926] text-gray-400 hover:text-white border border-[#232a3e]'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid of mangas for that day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {dayMangas.slice(0, 4).map((m) => (
          <Link
            key={m.id}
            href={`/manga/${m.slug}`}
            className="group flex items-center gap-3 p-3 rounded-2xl bg-[#141826] hover:bg-[#1a2033] border border-[#20273c] hover:border-rose-500/40 transition-all"
          >
            <img
              src={m.cover_url}
              alt={m.title}
              className="w-14 h-20 object-cover rounded-xl border border-[#273047] shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                {m.title}
              </h4>
              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                {m.author || "Muallif"}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  <BookOpen className="w-3 h-3" />
                  {m.chapter_count ? `${m.chapter_count}-bob` : 'Yangi'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
