import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  
  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination required' }, { status: 400 });
  }

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      new URLSearchParams({
        origins: origin,
        destinations: destination,
        mode: 'driving',
        language: 'fr',
        key: GOOGLE_API_KEY
      })
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Distance API Error:', error);
    return NextResponse.json({ error: 'API Error' }, { status: 500 });
  }
}