import { NextRequest, NextResponse } from 'next/server';
import { rateManga } from '@/lib/manga-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const score = parseFloat(body.score);

    if (isNaN(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Valid score between 1 and 5 is required' }, { status: 400 });
    }

    const result = rateManga(slug, score);
    if (!result) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error rating manga:', error);
    return NextResponse.json({ error: 'Failed to rate manga' }, { status: 500 });
  }
}
