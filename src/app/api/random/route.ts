import { NextResponse } from 'next/server';
import { getRandomMangaSlug } from '@/lib/manga-service';

export async function GET() {
  const slug = getRandomMangaSlug();
  return NextResponse.redirect(new URL(`/manga/${slug}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
