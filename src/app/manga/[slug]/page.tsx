import React from 'react';
import { notFound } from 'next/navigation';
import { getMangaBySlug } from '@/lib/manga-service';
import MangaDetailView from '@/components/MangaDetailView';

export const instant = false;

interface MangaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MangaPageProps) {
  const { slug } = await params;
  const manga = getMangaBySlug(slug);
  if (!manga) return { title: 'Manga topilmadi' };

  return {
    title: `${manga.title} — AnimeKO.uz`,
    description: manga.description || `${manga.title} o‘zbek tilida barcha boblari bepul.`,
    openGraph: {
      title: manga.title,
      description: manga.description || undefined,
      images: [manga.cover_url]
    }
  };
}

export default async function MangaPage({ params }: MangaPageProps) {
  const { slug } = await params;
  const manga = getMangaBySlug(slug);

  if (!manga) {
    notFound();
  }

  return <MangaDetailView manga={manga} />;
}
