import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function LatestChaptersSection() {
  return (
    <section className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-red-600 rounded-full inline-block" />
          <h2 className="text-lg font-bold text-white tracking-tight">So‘nggi boblar</h2>
        </div>
        <Link
          href="/catalog?sort=latest"
          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
        >
          Barchasi
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Empty State matching Screenshot 2 */}
      <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-gray-600">
          <BookOpen className="w-10 h-10 stroke-[1.25]" />
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Oxirgi qo‘shilgan boblar mavjud emas
        </p>
      </div>
    </section>
  );
}
