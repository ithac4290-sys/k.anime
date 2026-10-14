import React from 'react';
import Link from 'next/link';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { getAllManga, getAllGenres } from '@/lib/manga-service';
import MangaCard from '@/components/MangaCard';

export const instant = false;

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    genre?: string;
    status?: string;
    type?: string;
    sort?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const currentGenre = params.genre || '';
  const currentStatus = params.status || 'all';
  const currentType = params.type || 'all';
  const currentSort = params.sort || 'views';

  const genres = getAllGenres();
  const { mangas, total } = getAllManga({
    search: search || undefined,
    genre: currentGenre || undefined,
    status: currentStatus,
    type: currentType,
    sort: currentSort,
    limit: 40
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Katalog</h1>
        <p className="text-sm text-gray-400 mt-1">
          Barcha manga, manxva va komikslarni qidiring hamda saralang
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-[#101420] border border-[#1e2538] rounded-2xl p-5 space-y-5">
        <form method="GET" action="/catalog" className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Sarlavha, muallif yoki rassom nomi bo‘yicha qidiruv..."
              className="w-full bg-[#161a29] border border-[#262f47] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Genre Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Janr</label>
              <select
                name="genre"
                defaultValue={currentGenre}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="">Barcha janrlar</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Turi</label>
              <select
                name="type"
                defaultValue={currentType}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">Barchasi</option>
                <option value="manga">Manga (Yaponcha)</option>
                <option value="manhwa">Manxva (Koreyscha)</option>
                <option value="manhua">Manxua (Xitoycha)</option>
                <option value="comic">Komiks</option>
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Holati</label>
              <select
                name="status"
                defaultValue={currentStatus}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">Barchasi</option>
                <option value="ongoing">Davom etmoqda</option>
                <option value="completed">Tugallangan</option>
              </select>
            </div>

            {/* Sort Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Saralash</label>
              <select
                name="sort"
                defaultValue={currentSort}
                className="w-full bg-[#161a29] border border-[#262f47] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-rose-500"
              >
                <option value="views">Eng ko‘p ko‘rilgan</option>
                <option value="latest">Yangi qo‘shilganlar</option>
                <option value="rating">Yuqori reyting</option>
                <option value="title">Nom bo‘yicha (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              Topilgan sarlavhalar: <strong className="text-white">{total} ta</strong>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/catalog"
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-[#191e2f] hover:bg-[#22293f] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tozalash
              </Link>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                Qidirish
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      {mangas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#101420] border border-[#1e2538] rounded-2xl space-y-3">
          <p className="text-lg font-bold text-gray-300">Hech qanday manga topilmadi</p>
          <p className="text-xs text-gray-500">Qidiruv parametrlarini o‘zgartirib qayta urinib ko‘ring.</p>
          <Link
            href="/catalog"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            Barcha mangalarni ko‘rish
          </Link>
        </div>
      )}
    </div>
  );
}
