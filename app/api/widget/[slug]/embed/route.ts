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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const platformFilter = searchParams.get('platform') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const forceRefresh = searchParams.get('force_refresh') === 'true';

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    // Get posts data
    let posts = null;
    if (!forceRefresh) {
      posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    }
    
    if (!posts) {
      if (!forceRefresh) {
        await cacheService.invalidate(widget.id);
      }
      
      // Wait for rate limit availability
      await rateLimiter.waitForNextAvailable();
      
      // Check if we can make the request
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

    // Generate HTML with real data
    const cardsHtml = posts.map(post => {
      const mainImage = post.images?.[0];
      const imageUrl = mainImage?.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=500&fit=crop';
      const platform = post.platform || 'Unknown';
      const status = post.status || 'Unknown';
      const title = post.title || 'Untitled';
      
      return `
        <div class="card">
          <img src="${imageUrl}" alt="${title}" loading="lazy">
          <div class="card-content">
            <h3>${title}</h3>
            <p>${platform} • ${status}</p>
          </div>
        </div>
      `;
    }).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${widget.name} - NotionWidgets Pro</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            line-height: 1.4;
        }
        .widget-container {
            max-width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #111827;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 12px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            max-width: 100%;
        }
        .card {
            background: #f9fafb;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        .card img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            display: block;
        }
        .card-content {
            padding: 8px;
        }
        .card h3 {
            margin: 0 0 4px 0;
            font-size: 12px;
            color: #111827;
            font-weight: 500;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .card p {
            margin: 0;
            font-size: 10px;
            color: #6b7280;
            line-height: 1.2;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }
        .empty-state h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #111827;
        }
        .empty-state p {
            margin: 0;
            font-size: 14px;
        }
        @media (max-width: 480px) {
            .grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
            }
            .card img {
                height: 100px;
            }
            .card-content {
                padding: 6px;
            }
            .card h3 {
                font-size: 11px;
            }
            .card p {
                font-size: 9px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="header">
            <h1>${widget.name}</h1>
            <p>NotionWidgets Pro</p>
        </div>
        
        ${posts.length === 0 ? `
        <div class="empty-state">
            <h3>No content found</h3>
            <p>This widget doesn't have any content yet.</p>
        </div>
        ` : `
        <div class="grid">
            ${cardsHtml}
        </div>
        `}
    </div>
</body>
</html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self' https://www.notion.so https://notion.so https://*.notion.so https://*.vercel.app https://vercel.app;",
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error generating embed HTML:', error);
    
    // Return fallback HTML on error
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Error - NotionWidgets Pro</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            text-align: center;
        }
        .error-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .error-container h1 {
            color: #ef4444;
            font-size: 18px;
            margin: 0 0 10px 0;
        }
        .error-container p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Widget Error</h1>
        <p>Unable to load widget content. Please try again later.</p>
    </div>
</body>
</html>
    `;
    
    return new NextResponse(fallbackHtml, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self' https://www.notion.so https://notion.so https://*.notion.so https://*.vercel.app https://vercel.app;",
      },
    });
  }
}