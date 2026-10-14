import { NextRequest, NextResponse } from 'next/server';
import { getMangaBySlug, createChapter } from '@/lib/manga-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const manga = getMangaBySlug(slug);

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!body.chapter_number || !Array.isArray(body.pages) || body.pages.length === 0) {
      return NextResponse.json({ error: 'chapter_number and pages array are required' }, { status: 400 });
    }

    const chapterId = createChapter(manga.id, {
      chapter_number: parseFloat(body.chapter_number),
      title: body.title,
      pages: body.pages
    });

    return NextResponse.json({ success: true, chapterId }, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
