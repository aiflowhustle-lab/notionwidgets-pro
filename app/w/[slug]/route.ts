import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Fallback data function
function getFallbackData() {
  return [
    {
      id: '1',
      title: 'Sample Instagram Post',
      publishDate: '2024-01-15',
      platform: 'Instagram',
      status: 'Done',
      imageSource: 'attachment',
      pinned: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop',
          source: 'attachment' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    },
    {
      id: '2',
      title: 'TikTok Video Thumbnail',
      publishDate: '2024-01-14',
      platform: 'TikTok',
      status: 'In progress',
      imageSource: 'link',
      pinned: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&h=500&fit=crop',
          source: 'link' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    },
    {
      id: '3',
      title: 'Canva Design',
      publishDate: '2024-01-13',
      platform: 'Others',
      status: 'Done',
      imageSource: 'canva',
      pinned: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
          source: 'canva' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    }
  ];
}

// Generate SVG snapshot
function generateSVGSnapshot(widget: any, posts: any[], viewMode: string = 'all') {
  const filteredPosts = viewMode === 'videos' 
    ? posts.filter(post => post.videos && post.videos.length > 0)
    : posts;

  const width = 600;
  const height = 400;
  const cardSize = 120;
  const cardsPerRow = 3;
  const rows = Math.ceil(filteredPosts.length / cardsPerRow);
  const actualHeight = Math.max(height, rows * cardSize + 100);

  let cardsSVG = '';
  
  if (filteredPosts.length === 0) {
    cardsSVG = `
      <rect x="200" y="150" width="200" height="100" fill="#f3f4f6" rx="8"/>
      <text x="300" y="200" text-anchor="middle" font-family="system-ui" font-size="14" fill="#6b7280">No content found</text>
    `;
  } else {
    filteredPosts.forEach((post, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = 50 + col * (cardSize + 10);
      const y = 80 + row * (cardSize + 10);
      
      const image = post.images && post.images[0];
      
      cardsSVG += `
        <rect x="${x}" y="${y}" width="${cardSize}" height="${cardSize}" fill="#f3f4f6" rx="8"/>
        ${image ? `
          <image href="${image.url}" x="${x}" y="${y}" width="${cardSize}" height="${cardSize}" clip-path="url(#clip${index})"/>
        ` : `
          <rect x="${x}" y="${y}" width="${cardSize}" height="${cardSize}" fill="#e5e7eb" rx="8"/>
          <text x="${x + cardSize/2}" y="${y + cardSize/2}" text-anchor="middle" font-family="system-ui" font-size="12" fill="#9ca3af">No Image</text>
        `}
        ${post.pinned ? `
          <rect x="${x + cardSize - 30}" y="${y + 5}" width="25" height="15" fill="#000" rx="3"/>
          <text x="${x + cardSize - 17.5}" y="${y + 14}" text-anchor="middle" font-family="system-ui" font-size="8" fill="#fff">PIN</text>
        ` : ''}
        ${post.videos && post.videos.length > 0 ? `
          <rect x="${x + 5}" y="${y + cardSize - 20}" width="30" height="15" fill="rgba(0,0,0,0.7)" rx="3"/>
          <text x="${x + 20}" y="${y + cardSize - 8}" text-anchor="middle" font-family="system-ui" font-size="8" fill="#fff">VIDEO</text>
        ` : ''}
        <defs>
          <clipPath id="clip${index}">
            <rect x="${x}" y="${y}" width="${cardSize}" height="${cardSize}" rx="8"/>
          </clipPath>
        </defs>
      `;
    });
  }

  return `
<svg width="${width}" height="${actualHeight}" viewBox="0 0 ${width} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: system-ui, -apple-system, sans-serif; font-size: 18px; font-weight: 600; fill: #111827; }
      .subtitle { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; fill: #6b7280; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#ffffff"/>
  
  <!-- Header -->
  <text x="300" y="30" text-anchor="middle" class="title">${widget.name}</text>
  <text x="300" y="50" text-anchor="middle" class="subtitle">NotionWidgets Pro</text>
  
  <!-- View mode indicator -->
  <rect x="250" y="60" width="100" height="25" fill="#f3f4f6" rx="12"/>
  <text x="300" y="77" text-anchor="middle" font-family="system-ui" font-size="12" fill="#374151">${viewMode === 'videos' ? 'Videos Only' : 'All Content'}</text>
  
  <!-- Cards -->
  ${cardsSVG}
  
  <!-- Footer -->
  <text x="300" y="${actualHeight - 20}" text-anchor="middle" font-family="system-ui" font-size="10" fill="#9ca3af">Open live widget for interactive features</text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const platformFilter = searchParams.get('platform') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const viewMode = searchParams.get('view') || 'all';
    const format = searchParams.get('format') || 'svg';

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      const errorSVG = `
<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="200" y="100" text-anchor="middle" font-family="system-ui" font-size="16" fill="#ef4444">Widget Not Found</text>
  <text x="200" y="120" text-anchor="middle" font-family="system-ui" font-size="12" fill="#6b7280">This widget could not be found or is not active</text>
</svg>`;
      return new NextResponse(errorSVG, { 
        status: 404,
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // Check cache first
    let posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    
    if (!posts) {
      // Cache miss - fetch from Notion with rate limiting
      await rateLimiter.waitForNextAvailable();
      
      const canMakeRequest = await rateLimiter.canMakeRequest();
      if (!canMakeRequest) {
        posts = getFallbackData();
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } else {
        try {
          const decryptedToken = decryptToken(widget.token);
          await rateLimiter.recordRequest();
          posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        } catch (error) {
          console.error('Error fetching from Notion:', error);
          posts = getFallbackData();
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        }
      }
    }

    // Generate SVG snapshot
    const svgContent = generateSVGSnapshot(widget, posts, viewMode);

    if (format === 'png') {
      // For PNG format, we'd need a library like puppeteer or canvas
      // For now, return SVG with proper headers
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300, s-maxage=300'
        }
      });
    }

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('Error generating image snapshot:', error);
    const errorSVG = `
<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="200" y="100" text-anchor="middle" font-family="system-ui" font-size="16" fill="#ef4444">Error Loading Widget</text>
  <text x="200" y="120" text-anchor="middle" font-family="system-ui" font-size="12" fill="#6b7280">Please try again later</text>
</svg>`;
    return new NextResponse(errorSVG, { 
      status: 500,
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}
