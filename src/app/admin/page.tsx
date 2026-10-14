'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, PlusCircle, BookPlus, Trash2, 
  Layers, Eye, BookOpen, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Manga, Genre } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'mangas' | 'add_manga' | 'add_chapter'>('mangas');
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [stats, setStats] = useState({ mangaCount: 0, chapterCount: 0, viewSum: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Manga form state
  const [newManga, setNewManga] = useState({
    title: '',
    original_title: '',
    description: '',
    cover_url: '',
    author: '',
    artist: '',
    status: 'ongoing',
    type: 'manga',
    release_year: 2026,
    genre_slugs: [] as string[]
  });

  // New Chapter form state
  const [newChapter, setNewChapter] = useState({
    mangaSlug: '',
    chapter_number: '',
    title: '',
    pages_text: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mangaRes, genresRes, statsRes] = await Promise.all([
        fetch('/api/manga?limit=100'),
        fetch('/api/genres'),
        fetch('/api/stats')
      ]);

      const mangaData = mangaRes.ok ? await mangaRes.json() : { mangas: [] };
      const genresData = genresRes.ok ? await genresRes.json() : [];
      const statsData = statsRes.ok ? await statsRes.json() : null;

      const mangaList = Array.isArray(mangaData.mangas) ? mangaData.mangas : [];
      setMangas(mangaList);
      setGenres(Array.isArray(genresData) ? genresData : []);
      setStats({
        mangaCount: Number(statsData?.mangaCount) || mangaList.length,
        chapterCount: Number(statsData?.chapterCount) || 0,
        viewSum: Number(statsData?.viewSum) || 0,
      });

      if (mangaList.length > 0 && !newChapter.mangaSlug) {
        setNewChapter((prev) => ({ ...prev, mangaSlug: mangaList[0].slug }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Ma'lumotlarni yuklashda xatolik yuz berdi", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      const res = await fetch('/api/manga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManga)
      });

      if (!res.ok) throw new Error("Manga yaratishda xatolik");

      setMessage({ text: "Manga muvaffaqiyatli yaratildi!", type: 'success' });
      setNewManga({
        title: '',
        original_title: '',
        description: '',
        cover_url: '',
        author: '',
        artist: '',
        status: 'ongoing',
        type: 'manga',
        release_year: new Date().getFullYear(),
        genre_slugs: []
      });
      fetchData();
      setActiveTab('mangas');
    } catch {
      setMessage({ text: "Manga yaratib bo'lmadi. Barcha maydonlarni tekshiring.", type: 'error' });
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      const pageList = newChapter.pages_text
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (pageList.length === 0) {
        setMessage({ text: "Kamida bitta sahifa rasm URL manzilini kiriting!", type: 'error' });
        return;
      }

      const res = await fetch(`/api/manga/${newChapter.mangaSlug}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_number: newChapter.chapter_number,
          title: newChapter.title,
          pages: pageList
        })
      });

      if (!res.ok) throw new Error("Bob qo'shishda xatolik");

      setMessage({ text: "Bob muvaffaqiyatli yuklandi!", type: 'success' });
      setNewChapter((prev) => ({
        ...prev,
        chapter_number: '',
        title: '',
        pages_text: ''
      }));
      fetchData();
      setActiveTab('mangas');
    } catch {
      setMessage({ text: "Bobni yuklashda xatolik yuz berdi.", type: 'error' });
    }
  };

  const handleDeleteManga = async (slug: string, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" mangasini va uning barcha boblarini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/manga/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `"${title}" o'chirildi`, type: 'success' });
        fetchData();
      }
    } catch {
      setMessage({ text: "O'chirishda xatolik yuz berdi", type: 'error' });
    }
  };

  const toggleGenre = (slug: string) => {
    setNewManga((prev) => {
      const exists = prev.genre_slugs.includes(slug);
      return {
        ...prev,
        genre_slugs: exists
          ? prev.genre_slugs.filter((s) => s !== slug)
          : [...prev.genre_slugs, slug]
      };
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2236] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white">Tarjimon & Admin Paneli</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            AnimeKO.uz platformasida manga va animelarni boshqarish, yangi sarlavhalar va boblarni kiritish
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#171b29] hover:bg-[#20263b] text-xs font-semibold text-gray-300 flex items-center gap-2 border border-[#272f47]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {/* Notification Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12141c] border border-[#1e202c] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Jami mangalar</p>
            <p className="text-2xl font-black text-white">{stats?.mangaCount ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#12141c] border border-[#1e202c] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Jami boblar</p>
            <p className="text-2xl font-black text-white">{stats?.chapterCount ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#12141c] border border-[#1e202c] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Jami ko‘rishlar</p>
            <p className="text-2xl font-black text-white">{(stats?.viewSum ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#21273b] gap-2">
        <button
          onClick={() => setActiveTab('mangas')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'mangas'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mangalar ro‘yxati ({mangas.length})
        </button>

        <button
          onClick={() => setActiveTab('add_manga')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'add_manga'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Yangi Manga kiritish
        </button>

        <button
          onClick={() => setActiveTab('add_chapter')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'add_chapter'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BookPlus className="w-4 h-4" />
          Yangi Bob yuklash
        </button>
      </div>

      {/* TAB 1: MANGAS LIST */}
      {activeTab === 'mangas' && (
        <div className="bg-[#101420] border border-[#1e2538] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#1c2236] flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Mavjud mangalar</h3>
            <button
              onClick={() => setActiveTab('add_manga')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Yangi manga
            </button>
          </div>

          <div className="divide-y divide-[#1b2133]">
            {mangas.map((m) => (
              <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#141928] transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={m.cover_url}
                    alt={m.title}
                    className="w-14 h-20 object-cover rounded-lg border border-[#273047] shrink-0"
                  />
                  <div className="space-y-1">
                    <Link href={`/manga/${m.slug}`} className="font-bold text-white hover:text-rose-400 text-sm">
                      {m.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="uppercase font-semibold text-rose-400">{m.type}</span>
                      <span>•</span>
                      <span>{m.status === 'completed' ? 'Tugallangan' : 'Davom etmoqda'}</span>
                      <span>•</span>
                      <span>{m.chapter_count || 0} bob</span>
                      <span>•</span>
                      <span>{m.views} ko‘rish</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setNewChapter((prev) => ({ ...prev, mangaSlug: m.slug }));
                      setActiveTab('add_chapter');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#1c2336] hover:bg-[#28324d] text-gray-200 text-xs font-semibold flex items-center gap-1 border border-[#2b3552]"
                  >
                    <BookPlus className="w-3.5 h-3.5 text-indigo-400" />
                    Bob qo‘shish
                  </button>

                  <button
                    onClick={() => handleDeleteManga(m.slug, m.title)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD MANGA */}
      {activeTab === 'add_manga' && (
        <form onSubmit={handleCreateManga} className="bg-[#101420] border border-[#1e2538] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-[#1c2236] pb-3">
            Yangi Manga yoki Manxva kiritish
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Manga nomi *</label>
              <input
                type="text"
                required
                value={newManga.title}
                onChange={(e) => setNewManga({ ...newManga, title: e.target.value })}
                placeholder="Masalan: Yolg'iz darajalanuvchi"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Original nomi (koreyscha / yaponcha)</label>
              <input
                type="text"
                value={newManga.original_title}
                onChange={(e) => setNewManga({ ...newManga, original_title: e.target.value })}
                placeholder="Masalan: Solo Leveling / 나 혼자만 레벨업"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Muqova rasmi (Cover Image URL) *</label>
              <input
                type="url"
                required
                value={newManga.cover_url}
                onChange={(e) => setNewManga({ ...newManga, cover_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Turi</label>
              <select
                value={newManga.type}
                onChange={(e) => setNewManga({ ...newManga, type: e.target.value as 'manga' | 'manhwa' | 'manhua' | 'comic' })}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="manga">Manga (Yaponcha)</option>
                <option value="manhwa">Manxva (Koreyscha)</option>
                <option value="manhua">Manxua (Xitoycha)</option>
                <option value="comic">Komiks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Holati</label>
              <select
                value={newManga.status}
                onChange={(e) => setNewManga({ ...newManga, status: e.target.value as 'ongoing' | 'completed' })}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ongoing">Davom etmoqda</option>
                <option value="completed">Tugallangan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Muallif</label>
              <input
                type="text"
                value={newManga.author}
                onChange={(e) => setNewManga({ ...newManga, author: e.target.value })}
                placeholder="Masalan: Chugong"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Rassom</label>
              <input
                type="text"
                value={newManga.artist}
                onChange={(e) => setNewManga({ ...newManga, artist: e.target.value })}
                placeholder="Masalan: DUBU"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tavsif (Synopsis)</label>
              <textarea
                rows={4}
                value={newManga.description}
                onChange={(e) => setNewManga({ ...newManga, description: e.target.value })}
                placeholder="Manga syujeti haqida qisqacha ma'lumot..."
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Genres selector */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Janrlarni tanlang:</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const selected = newManga.genre_slugs.includes(g.slug);
                  return (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => toggleGenre(g.slug)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-[#161a29] border-[#262f47] text-gray-400 hover:text-white'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1c2236] flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            >
              Manga yaratish
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ADD CHAPTER */}
      {activeTab === 'add_chapter' && (
        <form onSubmit={handleCreateChapter} className="bg-[#101420] border border-[#1e2538] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-[#1c2236] pb-3">
            Manga uchun yangi Bob (Chapter) yuklash
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Qaysi manga uchun? *</label>
              <select
                required
                value={newChapter.mangaSlug}
                onChange={(e) => setNewChapter({ ...newChapter, mangaSlug: e.target.value })}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              >
                {mangas.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.title} ({m.chapter_count || 0} bob mavjud)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bob raqami *</label>
              <input
                type="number"
                step="0.1"
                required
                value={newChapter.chapter_number}
                onChange={(e) => setNewChapter({ ...newChapter, chapter_number: e.target.value })}
                placeholder="Masalan: 4 yoki 4.5"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bob sarlavhasi (Ixtiyoriy)</label>
              <input
                type="text"
                value={newChapter.title}
                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                placeholder="Masalan: Qorong'ulikning qaytishi"
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Sahifalar rasmlari (Har bir qatorga 1 ta rasm URL manzili) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewChapter((prev) => ({
                      ...prev,
                      pages_text: `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80`
                    }));
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Namuna rasmlarni to‘ldirish
                </button>
              </div>

              <textarea
                rows={6}
                required
                value={newChapter.pages_text}
                onChange={(e) => setNewChapter({ ...newChapter, pages_text: e.target.value })}
                placeholder={`https://server.com/page1.jpg\nhttps://server.com/page2.jpg\nhttps://server.com/page3.jpg`}
                className="w-full font-mono text-xs bg-[#161a29] border border-[#262f47] rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Kiritilgan sahifalar avtomatik tartiblanadi va o‘quvchida vertikal (vebtun) yoki birma-bir ochiladi.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1c2236] flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Bobni yuklash
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
