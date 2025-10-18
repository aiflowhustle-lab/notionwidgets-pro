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
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *; frame-ancestors *; img-src * data: blob:; style-src 'self' 'unsafe-inline' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src *; font-src *;",
        'Cache-Control': 'public, max-age=600',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer-when-downgrade',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
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

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const cardsHTML = filteredPosts.map(post => {
    const title = escapeHtml(post.title || 'Untitled');
    const platform = escapeHtml(post.platform || 'Unknown');
    const status = escapeHtml(post.status || 'Unknown');
    const imageUrl = post.images[0]?.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop';
    const pinned = post.pinned ? '<div class="pinned">Pinned</div>' : '';
    
    return `
      <div class="card">
        ${pinned}
        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop'">
        <div class="card-content">
          <h3>${title}</h3>
          <div class="card-meta">
            <span class="platform">${platform}</span>
            <span class="status">${status}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${escapeHtml(widget.name)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            height: 100%;
            overflow-x: hidden;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8fafc;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .widget-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 16px;
            min-height: 100vh;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 14px;
            color: #718096;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            width: 100%;
        }
        .card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease-in-out;
            position: relative;
            border: 1px solid #e2e8f0;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .card img {
            width: 100%;
            height: 240px;
            object-fit: cover;
            display: block;
            background: #f7fafc;
        }
        .card-content {
            padding: 20px;
        }
        .card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        .platform {
            background: #edf2f7;
            color: #4a5568;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 12px;
        }
        .status {
            color: #38a169;
            font-weight: 500;
            font-size: 12px;
        }
        .pinned {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #718096;
        }
        .empty-state h3 {
            font-size: 18px;
            margin-bottom: 8px;
            color: #4a5568;
        }
        .empty-state p {
            font-size: 14px;
        }
        
        /* Mobile optimizations for Notion iPad app */
        @media screen and (max-width: 768px) {
            .widget-container {
                padding: 12px;
            }
            .grid {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
            }
            .card img {
                height: 180px;
            }
            .card-content {
                padding: 12px;
            }
            .card h3 {
                font-size: 14px;
                margin-bottom: 8px;
            }
            .card-meta {
                font-size: 11px;
            }
            .platform, .status {
                font-size: 10px;
            }
        }
        
        /* Extra small screens */
        @media screen and (max-width: 480px) {
            .grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 8px;
            }
            .card img {
                height: 160px;
            }
            .card-content {
                padding: 8px;
            }
        }
        
        /* Prevent text selection on cards for better mobile experience */
        .card {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Ensure images load properly */
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="header">
            <h1>${escapeHtml(widget.name)}</h1>
            <p>Content Gallery</p>
        </div>
        <div class="grid">
            ${filteredPosts.length > 0 ? cardsHTML : `
                <div class="empty-state">
                    <h3>No content found</h3>
                    <p>This widget doesn't have any posts yet.</p>
                </div>
            `}
        </div>
    </div>
</body>
</html>`;
}
