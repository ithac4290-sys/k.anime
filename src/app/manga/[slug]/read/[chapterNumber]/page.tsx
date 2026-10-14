import React from 'react';
import { notFound } from 'next/navigation';
import { getChapterWithPages } from '@/lib/manga-service';
import ReaderViewer from '@/components/ReaderViewer';

export const instant = false;

interface ReadPageProps {
  params: Promise<{
    slug: string;
    chapterNumber: string;
  }>;
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { slug, chapterNumber } = await params;
  const num = parseFloat(chapterNumber);

  if (isNaN(num)) {
    notFound();
  }

  const data = getChapterWithPages(slug, num);

  if (!data) {
    notFound();
  }

  return (
    <ReaderViewer
      manga={data.manga}
      chapter={data.chapter}
      pages={data.pages}
      prevChapterNumber={data.prevChapterNumber}
      nextChapterNumber={data.nextChapterNumber}
      allChapters={data.allChapters}
    />
  );
}
