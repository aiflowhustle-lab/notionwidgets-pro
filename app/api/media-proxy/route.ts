import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const type = searchParams.get('type') || 'image';
  
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Validate allowed domains to prevent abuse
  const allowedDomains = [
    'canva.com',
    'www.canva.com', 
    'images.unsplash.com',
    's3.us-west-2.amazonaws.com',
    'notion-static.com',
    'secure.notion-static.com',
    'prod-files-secure.s3.us-west-2.amazonaws.com'
  ];
  
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  
  if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    // Fetch the content with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NotionWidgets-Pro/1.0',
        'Referer': 'https://notion.so',
        'Accept': type === 'iframe' ? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' : 'image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: 'Failed to fetch content', 
        status: response.status,
        url: url 
      }, { status: response.status });
    }

    const content = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || (type === 'iframe' ? 'text/html' : 'image/jpeg');
    
    // Return the content with appropriate headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error(`Proxy error for ${url}:`, error);
    return NextResponse.json({ 
      error: 'Proxy error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
