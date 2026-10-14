export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Manga {
  id: number;
  slug: string;
  title: string;
  original_title?: string | null;
  description?: string | null;
  cover_url: string;
  author?: string | null;
  artist?: string | null;
  status: 'ongoing' | 'completed';
  type: 'manga' | 'manhwa' | 'manhua' | 'comic';
  release_year?: number | null;
  views: number;
  rating: number;
  rating_count?: number;
  schedule_day?: string | null;
  created_at: string;
  updated_at: string;
  genres?: Genre[];
  latest_chapter?: ChapterSummary | null;
  chapter_count?: number;
}

export interface ChapterSummary {
  id: number;
  chapter_number: number;
  title?: string | null;
  created_at: string;
}

export interface Chapter {
  id: number;
  manga_id: number;
  chapter_number: number;
  title?: string | null;
  volume?: number | null;
  created_at: string;
  pages?: ChapterPage[];
}

export interface ChapterPage {
  id: number;
  chapter_id: number;
  page_number: number;
  image_url: string;
}

export interface MangaComment {
  id: number;
  manga_id: number;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface ReadingHistoryItem {
  manga_id: number;
  slug: string;
  title: string;
  cover_url: string;
  chapter_number: number;
  total_chapters: number;
  updated_at: string;
}
