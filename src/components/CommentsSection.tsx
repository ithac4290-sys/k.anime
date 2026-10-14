'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, User } from 'lucide-react';
import { MangaComment } from '@/types';

interface CommentsSectionProps {
  mangaSlug: string;
}

export default function CommentsSection({ mangaSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<MangaComment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/manga/${mangaSlug}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoaded(true));
  }, [mangaSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/manga/${mangaSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim(),
          content: content.trim(),
          rating
        })
      });

      if (res.ok) {
        const newComm = await res.json();
        setComments((prev) => [newComm, ...prev]);
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#101420] border border-[#1e2538] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1f263a] pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-rose-500" />
          <h3 className="text-xl font-bold text-white">Sharhlar va Fikrlar</h3>
        </div>
        <span className="text-xs text-gray-400 font-semibold">
          {comments.length} ta fikr
        </span>
      </div>

      {/* New comment input form */}
      <form onSubmit={handleSubmit} className="bg-[#151926] border border-[#242b3f] rounded-xl p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
          O‘z fikringizni qoldiring:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Ismingiz yoki taxallusingiz</label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Masalan: Sardor"
              className="w-full bg-[#1b2133] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Baholang (1-5 yulduz)</label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-2">{rating} / 5</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Fikringiz</label>
          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Manga yoki bob haqida nima deb o'ylaysiz? Tarjima sifati qanday?"
            className="w-full bg-[#1b2133] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/30 disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Yuborilmoqda...' : 'Sharh qoldirish'}
          </button>
        </div>
      </form>

      {/* List of comments */}
      <div className="space-y-3 pt-2">
        {!loaded ? (
          <p className="text-xs text-gray-500">Sharhlar yuklanmoqda...</p>
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-[#141826] border border-[#20273c] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-sm text-gray-200">{c.author_name}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: c.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-9">
                {c.content}
              </p>
              <div className="pl-9 text-[10px] text-gray-500">
                {new Date(c.created_at).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">
            Birinchi bo‘lib ushbu manga haqida o‘z fikringizni qoldiring!
          </p>
        )}
      </div>
    </section>
  );
}
