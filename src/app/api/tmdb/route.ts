import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || ''; // User will set this
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  if (!path || path.length > 200 || !/^\/[a-zA-Z0-9_\-\/]+$/.test(path)) {
    return NextResponse.json({ error: 'Invalid or missing path' }, { status: 400 });
  }
  
  if (!TMDB_API_KEY) {
    // Graceful degradation when API key is missing
    return NextResponse.json({ results: [] }, { status: 200 });
  }
  
  // Build TMDB URL with all query params
  const tmdbUrl = new URL(`${TMDB_BASE_URL}${path}`);
  searchParams.forEach((value, key) => {
    if (key !== 'path') tmdbUrl.searchParams.set(key, value);
  });
  tmdbUrl.searchParams.set('api_key', TMDB_API_KEY);
  
  try {
    const response = await fetch(tmdbUrl.toString(), {
      next: { revalidate: 1800 } // 30 min cache
    });
    const data = await response.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'TMDB fetch failed' }, { status: 502 });
  }
}
