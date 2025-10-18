import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const platformFilter = searchParams.get('platform') || undefined;
  const statusFilter = searchParams.get('status') || undefined;
  
  try {
    // Get widget data
    const widget = await getWidget(slug);
    if (!widget) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    // Try to get cached data first
    let posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    
    if (!posts) {
      // Always try to fetch from Notion first
      try {
        console.log('Fetching from Notion for widget:', widget.id);
        const decryptedToken = decryptToken(widget.token);
        
        // Skip rate limiting for embed requests
        posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
        console.log('Successfully fetched', posts.length, 'posts from Notion');
        
        // Cache the result
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } catch (error) {
        console.error('Error fetching from Notion:', error);
        console.log('Using fallback data due to error');
        posts = getFallbackData();
      }
    }

    // Generate the widget HTML
    const html = generateWidgetHTML(posts, widget, platformFilter, statusFilter);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *; img-src * data: blob:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; font-src *;",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.error('Error in embed route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
    }
  ];
}

function generateWidgetHTML(posts: any[], widget: any, platformFilter?: string, statusFilter?: string) {
  const filteredPosts = posts.filter(post => {
    if (platformFilter && post.platform !== platformFilter) return false;
    if (statusFilter && post.status !== statusFilter) return false;
    return true;
  });

  // Ultra-minimal HTML for Notion iPad app - NO CSS, NO JAVASCRIPT
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate ultra-simple HTML without any complex styling
  const cardsHTML = filteredPosts.map(post => {
    const title = escapeHtml(post.title || 'Untitled');
    const platform = escapeHtml(post.platform || 'Unknown');
    const status = escapeHtml(post.status || 'Unknown');
    const imageUrl = post.images[0]?.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop';
    const pinned = post.pinned ? ' [PINNED]' : '';
    
    return `
      <div>
        <img src="${imageUrl}" alt="${title}" width="100%" height="200">
        <h3>${title}${pinned}</h3>
        <p><strong>Platform:</strong> ${platform} | <strong>Status:</strong> ${status}</p>
        <hr>
      </div>
    `;
  }).join('');

  // Ultra-minimal HTML - just basic HTML tags, no CSS, no JavaScript
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(widget.name)}</title>
</head>
<body>
    <h1>${escapeHtml(widget.name)}</h1>
    <p>Content Gallery</p>
    <hr>
    ${filteredPosts.length > 0 ? cardsHTML : '<p>No content found</p>'}
</body>
</html>`;
}
