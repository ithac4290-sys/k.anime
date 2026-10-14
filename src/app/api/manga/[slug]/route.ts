import { NextRequest, NextResponse } from 'next/server';
import { getMangaBySlug, deleteManga } from '@/lib/manga-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const manga = getMangaBySlug(slug);

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error('Error fetching manga by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch manga' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const manga = getMangaBySlug(slug);

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    const success = deleteManga(manga.id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting manga:', error);
    return NextResponse.json({ error: 'Failed to delete manga' }, { status: 500 });
  }
}
