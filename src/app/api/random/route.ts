import { NextResponse } from 'next/server';
import { getRandomMangaSlug } from '@/lib/manga-service';

export async function GET() {
  const slug = getRandomMangaSlug();
  const target = slug ? `/manga/${slug}` : '/catalog';
  return NextResponse.redirect(new URL(target, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
