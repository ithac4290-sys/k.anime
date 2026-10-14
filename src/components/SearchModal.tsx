'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Star, BookOpen, ArrowRight } from 'lucide-react';
import { Manga } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setResults(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && query.trim()) {
      onClose();
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#121624] border border-[#27304a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#20273c]">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Anime, manga yoki personaj nomi..."
            className="w-full bg-transparent px-3 py-4 text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded bg-[#1c2236] text-[11px] text-gray-400 border border-[#2a3450]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#1b2133]">
          {loading ? (
            <div className="p-6 text-center text-xs text-gray-400">Qidirilmoqda...</div>
          ) : results.length > 0 ? (
            results.map((m) => (
              <Link
                key={m.id}
                href={`/manga/${m.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a2135] transition-colors group"
              >
                <img
                  src={m.cover_url}
                  alt={m.title}
                  className="w-10 h-14 object-cover rounded-lg border border-[#262f47] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors truncate">
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="uppercase text-[10px] font-bold text-rose-400">{m.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400" /> {m.rating}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))
          ) : query.trim() ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Hech qanday manga topilmadi. &ldquo;Enter&rdquo; tugmasini bosib to‘liq katalogda qidiring.
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-500 space-y-1">
              <p>Tezkor qidiruv uchun yozishni boshlang</p>
              <p className="text-[11px] text-gray-600">Masalan: Solo Leveling, Titanlar, Sehrli jang</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        {query.trim() && (
          <div className="p-3 bg-[#0e121d] border-t border-[#1e2538] flex items-center justify-between text-xs text-gray-400">
            <span>To‘liq natijalarni ko‘rish uchun</span>
            <Link
              href={`/catalog?search=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              Katalogda ochish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
