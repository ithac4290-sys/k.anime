import { getDb } from './db';
import { Manga, Genre, Chapter, ChapterPage } from '@/types';

export function getAllManga(options?: {
  search?: string;
  genre?: string;
  status?: string;
  type?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): { mangas: Manga[]; total: number } {
  const db = getDb();
  let whereClauses: string[] = [];
  const params: unknown[] = [];

  if (options?.search) {
    whereClauses.push('(m.title LIKE ? OR m.original_title LIKE ? OR m.author LIKE ?)');
    const searchTerm = `%${options.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (options?.genre) {
    whereClauses.push('m.id IN (SELECT manga_id FROM manga_genres mg JOIN genres g ON mg.genre_id = g.id WHERE g.slug = ?)');
    params.push(options.genre);
  }

  if (options?.status && options.status !== 'all') {
    whereClauses.push('m.status = ?');
    params.push(options.status);
  }

  if (options?.type && options.type !== 'all') {
    whereClauses.push('m.type = ?');
    params.push(options.type);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderSql = 'ORDER BY m.views DESC';
  if (options?.sort === 'latest') {
    orderSql = 'ORDER BY m.created_at DESC';
  } else if (options?.sort === 'rating') {
    orderSql = 'ORDER BY m.rating DESC';
  } else if (options?.sort === 'title') {
    orderSql = 'ORDER BY m.title ASC';
  }

  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM manga m ${whereSql}`).get(...params) as { count: number };

  const query = `
    SELECT 
      m.*,
      (SELECT COUNT(*) FROM chapters c WHERE c.manga_id = m.id) as chapter_count,
      (
        SELECT json_object(
          'id', c.id,
          'chapter_number', c.chapter_number,
          'title', c.title,
          'created_at', c.created_at
        )
        FROM chapters c 
        WHERE c.manga_id = m.id 
        ORDER BY c.chapter_number DESC 
        LIMIT 1
      ) as latest_chapter_json
    FROM manga m
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(query).all(...params, limit, offset) as Array<Record<string, unknown>>;

  const genreStmt = db.prepare(`
    SELECT g.id, g.name, g.slug 
    FROM genres g 
    JOIN manga_genres mg ON g.id = mg.genre_id 
    WHERE mg.manga_id = ?
  `);

  const mangas: Manga[] = rows.map((r) => {
    const genres = genreStmt.all(r.id) as Genre[];
    let latest_chapter = null;
    if (typeof r.latest_chapter_json === 'string') {
      try {
        latest_chapter = JSON.parse(r.latest_chapter_json);
      } catch {
        latest_chapter = null;
      }
    }

    return {
      id: r.id as number,
      slug: r.slug as string,
      title: r.title as string,
      original_title: r.original_title as string | null,
      description: r.description as string | null,
      cover_url: r.cover_url as string,
      author: r.author as string | null,
      artist: r.artist as string | null,
      status: r.status as 'ongoing' | 'completed',
      type: r.type as 'manga' | 'manhwa' | 'manhua' | 'comic',
      release_year: r.release_year as number | null,
      views: r.views as number,
      rating: r.rating as number,
      rating_count: (r.rating_count as number) || 1,
      schedule_day: (r.schedule_day as string) || 'Dushanba',
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      genres,
      latest_chapter,
      chapter_count: r.chapter_count as number
    };
  });

  return { mangas, total: countRow.count };
}

export function getMangaBySlug(slug: string): (Manga & { chapters: Chapter[] }) | null {
  const db = getDb();
  
  const normalizedSlug = slug === 'gertsogning-qayta-tugilgan-kenja-ogli-qotil' ? 'gertsogning-kenja-ogli' : slug;

  // increment views
  db.prepare('UPDATE manga SET views = views + 1 WHERE slug = ?').run(normalizedSlug);

  const row = db.prepare('SELECT * FROM manga WHERE slug = ?').get(normalizedSlug) as Record<string, unknown> | undefined;
  if (!row) return null;

  const genres = db.prepare(`
    SELECT g.id, g.name, g.slug 
    FROM genres g 
    JOIN manga_genres mg ON g.id = mg.genre_id 
    WHERE mg.manga_id = ?
  `).all(row.id) as Genre[];

  const chapters = db.prepare(`
    SELECT id, manga_id, chapter_number, title, volume, created_at 
    FROM chapters 
    WHERE manga_id = ? 
    ORDER BY chapter_number ASC
  `).all(row.id) as Chapter[];

  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    original_title: row.original_title as string | null,
    description: row.description as string | null,
    cover_url: row.cover_url as string,
    author: row.author as string | null,
    artist: row.artist as string | null,
    status: row.status as 'ongoing' | 'completed',
    type: row.type as 'manga' | 'manhwa' | 'manhua' | 'comic',
    release_year: row.release_year as number | null,
    views: (row.views as number) + 1,
    rating: row.rating as number,
    rating_count: (row.rating_count as number) || 1,
    schedule_day: (row.schedule_day as string) || 'Dushanba',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    genres,
    chapters,
    chapter_count: chapters.length
  };
}

export function getChapterWithPages(mangaSlug: string, chapterNumber: number): {
  manga: Manga;
  chapter: Chapter;
  pages: ChapterPage[];
  prevChapterNumber: number | null;
  nextChapterNumber: number | null;
  allChapters: { id: number; chapter_number: number; title: string | null }[];
} | null {
  const db = getDb();
  const normalizedSlug = mangaSlug === 'gertsogning-qayta-tugilgan-kenja-ogli-qotil' ? 'gertsogning-kenja-ogli' : mangaSlug;

  const mangaRow = db.prepare('SELECT * FROM manga WHERE slug = ?').get(normalizedSlug) as Record<string, unknown> | undefined;
  if (!mangaRow) return null;

  const chapterRow = db.prepare(`
    SELECT * FROM chapters WHERE manga_id = ? AND chapter_number = ?
  `).get(mangaRow.id, chapterNumber) as Record<string, unknown> | undefined;

  if (!chapterRow) return null;

  const pages = db.prepare(`
    SELECT * FROM chapter_pages WHERE chapter_id = ? ORDER BY page_number ASC
  `).all(chapterRow.id) as ChapterPage[];

  const allChapters = db.prepare(`
    SELECT id, chapter_number, title 
    FROM chapters 
    WHERE manga_id = ? 
    ORDER BY chapter_number ASC
  `).all(mangaRow.id) as { id: number; chapter_number: number; title: string | null }[];

  const currentIndex = allChapters.findIndex(c => Number(c.chapter_number) === Number(chapterNumber));
  const prevChapterNumber = currentIndex > 0 ? allChapters[currentIndex - 1].chapter_number : null;
  const nextChapterNumber = currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1].chapter_number : null;

  return {
    manga: {
      id: mangaRow.id as number,
      slug: mangaRow.slug as string,
      title: mangaRow.title as string,
      original_title: mangaRow.original_title as string | null,
      description: mangaRow.description as string | null,
      cover_url: mangaRow.cover_url as string,
      status: mangaRow.status as 'ongoing' | 'completed',
      type: mangaRow.type as 'manga' | 'manhwa' | 'manhua' | 'comic',
      views: mangaRow.views as number,
      rating: mangaRow.rating as number,
      created_at: mangaRow.created_at as string,
      updated_at: mangaRow.updated_at as string
    },
    chapter: {
      id: chapterRow.id as number,
      manga_id: chapterRow.manga_id as number,
      chapter_number: chapterRow.chapter_number as number,
      title: chapterRow.title as string | null,
      volume: chapterRow.volume as number | null,
      created_at: chapterRow.created_at as string
    },
    pages,
    prevChapterNumber,
    nextChapterNumber,
    allChapters
  };
}

export function getAllGenres(): Genre[] {
  const db = getDb();
  return db.prepare('SELECT id, name, slug FROM genres ORDER BY name ASC').all() as Genre[];
}

export function createManga(data: {
  title: string;
  original_title?: string;
  slug?: string;
  description?: string;
  cover_url: string;
  author?: string;
  artist?: string;
  status: 'ongoing' | 'completed';
  type: 'manga' | 'manhwa' | 'manhua' | 'comic';
  release_year?: number;
  genre_slugs?: string[];
}): Manga {
  const db = getDb();
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const stmt = db.prepare(`
    INSERT INTO manga (title, original_title, slug, description, cover_url, author, artist, status, type, release_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.title,
    data.original_title || null,
    slug,
    data.description || null,
    data.cover_url,
    data.author || null,
    data.artist || null,
    data.status,
    data.type,
    data.release_year || null
  );

  const mangaId = info.lastInsertRowid;

  if (data.genre_slugs && data.genre_slugs.length > 0) {
    const genreInsert = db.prepare(`
      INSERT OR IGNORE INTO manga_genres (manga_id, genre_id)
      VALUES (?, (SELECT id FROM genres WHERE slug = ?))
    `);
    for (const g of data.genre_slugs) {
      genreInsert.run(mangaId, g);
    }
  }

  return getMangaBySlug(slug)!;
}

export function createChapter(mangaId: number, data: {
  chapter_number: number;
  title?: string;
  pages: string[];
}): number {
  const db = getDb();

  const insertChapter = db.prepare(`
    INSERT INTO chapters (manga_id, chapter_number, title)
    VALUES (?, ?, ?)
  `);

  const info = insertChapter.run(mangaId, data.chapter_number, data.title || null);
  const chapterId = info.lastInsertRowid;

  const insertPage = db.prepare(`
    INSERT INTO chapter_pages (chapter_id, page_number, image_url)
    VALUES (?, ?, ?)
  `);

  data.pages.forEach((url, idx) => {
    insertPage.run(chapterId, idx + 1, url.trim());
  });

  return Number(chapterId);
}

export function deleteManga(id: number): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM manga WHERE id = ?').run(id);
  return res.changes > 0;
}

export function getStats() {
  const db = getDb();
  const mangaCount = (db.prepare('SELECT COUNT(*) as count FROM manga').get() as { count: number }).count;
  const chapterCount = (db.prepare('SELECT COUNT(*) as count FROM chapters').get() as { count: number }).count;
  const viewSum = (db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM manga').get() as { total: number }).total;
  return { mangaCount, chapterCount, viewSum };
}

export function getComments(mangaId: number) {
  const db = getDb();
  return db.prepare(`
    SELECT id, manga_id, author_name, content, rating, created_at 
    FROM comments 
    WHERE manga_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(mangaId);
}

export function addComment(mangaId: number, authorName: string, content: string, rating: number = 5) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO comments (manga_id, author_name, content, rating)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(mangaId, authorName, content, rating);
  return db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
}

export function searchMangaQuick(query: string) {
  const db = getDb();
  const q = `%${query}%`;
  return db.prepare(`
    SELECT id, slug, title, original_title, cover_url, rating, type, status 
    FROM manga 
    WHERE title LIKE ? OR original_title LIKE ? OR author LIKE ?
    LIMIT 6
  `).all(q, q, q);
}

export function rateManga(slug: string, score: number): { rating: number; rating_count: number } | null {
  const db = getDb();
  const row = db.prepare('SELECT id, rating, rating_count FROM manga WHERE slug = ?').get(slug) as { id: number; rating: number; rating_count: number } | undefined;
  if (!row) return null;

  const currentCount = row.rating_count || 1;
  const currentRating = row.rating || 4.8;
  const newCount = currentCount + 1;
  const newRating = parseFloat((((currentRating * currentCount) + score) / newCount).toFixed(2));

  db.prepare('UPDATE manga SET rating = ?, rating_count = ? WHERE id = ?').run(newRating, newCount, row.id);
  return { rating: newRating, rating_count: newCount };
}

export function getRandomMangaSlug(): string | null {
  const db = getDb();
  const row = db.prepare('SELECT slug FROM manga ORDER BY RANDOM() LIMIT 1').get() as { slug: string } | undefined;
  return row ? row.slug : null;
}

export function getMangasBySlugs(slugs: string[]): Manga[] {
  const db = getDb();
  const placeholders = slugs.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM manga WHERE slug IN (${placeholders})`).all(...slugs) as Array<Record<string, unknown>>;
  const map = new Map(rows.map(r => [r.slug as string, r]));
  
  return slugs
    .map(slug => map.get(slug))
    .filter(Boolean)
    .map(r => ({
      id: r!.id as number,
      slug: r!.slug as string,
      title: r!.title as string,
      original_title: r!.original_title as string | null,
      description: r!.description as string | null,
      cover_url: r!.cover_url as string,
      author: r!.author as string | null,
      artist: r!.artist as string | null,
      status: r!.status as 'ongoing' | 'completed',
      type: r!.type as 'manga' | 'manhwa' | 'manhua' | 'comic',
      release_year: r!.release_year as number | null,
      views: r!.views as number,
      rating: r!.rating as number,
      rating_count: (r!.rating_count as number) || 1,
      schedule_day: (r!.schedule_day as string) || 'Dushanba',
      created_at: r!.created_at as string,
      updated_at: r!.updated_at as string,
      genres: [],
      latest_chapter: null,
      chapter_count: 3
    }));
}



