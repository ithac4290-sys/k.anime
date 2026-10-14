import { NextRequest, NextResponse } from 'next/server';
import { getAllManga, createManga } from '@/lib/manga-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const data = getAllManga({ search, genre, status, type, sort, limit, offset });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching manga:', error);
    return NextResponse.json({ error: 'Failed to fetch manga' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.cover_url) {
      return NextResponse.json({ error: 'Title and cover_url are required' }, { status: 400 });
    }

    const manga = createManga(body);
    return NextResponse.json(manga, { status: 201 });
  } catch (error) {
    console.error('Error creating manga:', error);
    return NextResponse.json({ error: 'Failed to create manga' }, { status: 500 });
  }
}
