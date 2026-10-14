'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check } from 'lucide-react';

interface RatingWidgetProps {
  mangaSlug: string;
  initialRating: number;
  initialCount?: number;
}

export default function RatingWidget({ mangaSlug, initialRating, initialCount = 1 }: RatingWidgetProps) {
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const votedMangas = localStorage.getItem('mangauz_voted_ratings');
      if (votedMangas) {
        const list = JSON.parse(votedMangas);
        if (list.includes(mangaSlug)) {
          setVoted(true);
        }
      }
    } catch {
      // ignore
    }
  }, [mangaSlug]);

  const handleVote = async (score: number) => {
    if (voted || loading) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/manga/${mangaSlug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });

      if (res.ok) {
        const data = await res.json();
        setRating(data.rating);
        setCount(data.rating_count);
        setVoted(true);

        const votedMangas = localStorage.getItem('mangauz_voted_ratings');
        const list = votedMangas ? JSON.parse(votedMangas) : [];
        list.push(mangaSlug);
        localStorage.setItem('mangauz_voted_ratings', JSON.stringify(list));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-3 bg-[#131726] border border-[#232b40] rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        <span className="font-black text-white text-base">{rating.toFixed(1)}</span>
        <span className="text-[11px] text-gray-400">({count} ovoz)</span>
      </div>

      <div className="h-4 w-px bg-[#262f47]" />

      {voted ? (
        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Baholandi
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-400 mr-1 hidden sm:inline">Baholang:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={loading}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(null)}
              onClick={() => handleVote(star)}
              className="p-0.5 text-gray-500 hover:scale-125 transition-transform"
              title={`${star} yulduz`}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  (hoverScore !== null ? star <= hoverScore : star <= Math.round(rating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
