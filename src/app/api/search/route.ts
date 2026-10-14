import { NextRequest, NextResponse } from 'next/server';
import { searchMangaQuick } from '@/lib/manga-service';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = searchMangaQuick(q.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in quick search:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
