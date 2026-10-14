import { NextRequest, NextResponse } from 'next/server';
import { getMangaBySlug, getComments, addComment } from '@/lib/manga-service';

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

    const comments = getComments(manga.id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

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
    if (!body.author_name || !body.content) {
      return NextResponse.json({ error: 'author_name and content are required' }, { status: 400 });
    }

    const rating = typeof body.rating === 'number' ? Math.min(5, Math.max(1, body.rating)) : 5;
    const comment = addComment(manga.id, body.author_name.trim(), body.content.trim(), rating);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
