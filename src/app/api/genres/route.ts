import { NextResponse } from 'next/server';
import { getAllGenres } from '@/lib/manga-service';

export async function GET() {
  try {
    const genres = getAllGenres();
    return NextResponse.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
