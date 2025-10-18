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
      // Fetch from Notion if no cache
      try {
        await rateLimiter.waitForNextAvailable();
        const canMakeRequest = await rateLimiter.canMakeRequest();
        
        if (canMakeRequest) {
          const decryptedToken = decryptToken(widget.token);
          await rateLimiter.recordRequest();
          
          posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        } else {
          // Use fallback data
          posts = getFallbackData();
        }
      } catch (error) {
        console.error('Error fetching from Notion:', error);
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

  // Ultra-simple HTML generation for Notion iPad compatibility
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate simple card HTML
  const cardsHTML = filteredPosts.map(post => {
    const title = escapeHtml(post.title || 'Untitled');
    const platform = escapeHtml(post.platform || 'Unknown');
    const status = escapeHtml(post.status || 'Unknown');
    const imageUrl = post.images[0]?.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop';
    const pinned = post.pinned ? '<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.8);color:white;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;">PINNED</div>' : '';
    
    return `
      <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative;margin-bottom:16px;">
        ${pinned}
        <img src="${imageUrl}" alt="${title}" style="width:100%;height:200px;object-fit:cover;display:block;">
        <div style="padding:16px;">
          <h3 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#333;line-height:1.4;">${title}</h3>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
            <span style="background:#f0f0f0;color:#666;padding:2px 8px;border-radius:12px;font-weight:500;">${platform}</span>
            <span style="color:#059669;font-weight:500;">${status}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Ultra-minimal HTML for maximum Notion iPad compatibility
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(widget.name)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 16px;
            line-height: 1.5;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e9ecef;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #212529;
            margin: 0 0 8px 0;
        }
        .header p {
            font-size: 14px;
            color: #6c757d;
            margin: 0;
        }
        .grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
        }
        .card {
            flex: 0 0 calc(50% - 8px);
            max-width: 300px;
        }
        .empty {
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
        }
        .empty h3 {
            font-size: 18px;
            margin: 0 0 8px 0;
            color: #495057;
        }
        .empty p {
            font-size: 14px;
            margin: 0;
        }
        @media (max-width: 768px) {
            .card {
                flex: 0 0 100%;
                max-width: 100%;
            }
            .header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(widget.name)}</h1>
            <p>Content Gallery</p>
        </div>
        <div class="grid">
            ${filteredPosts.length > 0 ? cardsHTML : `
                <div class="empty">
                    <h3>No content found</h3>
                    <p>This widget doesn't have any posts yet.</p>
                </div>
            `}
        </div>
    </div>
</body>
</html>`;
}
