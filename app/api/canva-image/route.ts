import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const canvaUrl = searchParams.get('url');
    const page = searchParams.get('page') || '1';
    
    if (!canvaUrl) {
      return NextResponse.json({ error: 'Canva URL is required' }, { status: 400 });
    }

    // Extract design ID from Canva URL
    const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
    if (!designIdMatch) {
      return NextResponse.json({ error: 'Invalid Canva URL' }, { status: 400 });
    }

    const designId = designIdMatch[1];
    
    // Try multiple Canva image URL formats
    const imageUrls = [
      // Format 1: Direct PNG export
      `https://www.canva.com/design/${designId}/view?page=${page}&format=png&w=800`,
      // Format 2: Alternative export format
      `https://www.canva.com/design/${designId}/view?page=${page}&format=jpg&w=800`,
      // Format 3: Public share format
      `https://www.canva.com/design/${designId}/view?page=${page}&embed`,
      // Format 4: Static image format
      `https://media.canva.com/1/image/${designId}/page-${page}.png`,
    ];

    // Try each URL format until one works
    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/*',
            'Referer': 'https://www.canva.com/',
          },
        });

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/png';
          
          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          });
        }
      } catch (error) {
        console.log(`Failed to fetch from ${imageUrl}:`, error);
        continue;
      }
    }

    // If all URLs fail, return a placeholder image
    const placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
          Canva Design (Page ${page})
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
          Click to view in Canva
        </text>
      </svg>
    `;

    return new NextResponse(placeholderSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in canva-image API:', error);
    return NextResponse.json({ error: 'Failed to fetch Canva image' }, { status: 500 });
  }
}
