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
        'Content-Security-Policy': "frame-ancestors *; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src *;",
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${widget.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            overflow-x: hidden;
        }
        .widget-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            position: relative;
        }
        .card:hover {
            transform: scale(1.02);
        }
        .card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .card-content {
            padding: 15px;
        }
        .card h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #111827;
            line-height: 1.4;
        }
        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #6b7280;
        }
        .platform {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
        .status {
            color: #059669;
        }
        .pinned {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        .error {
            text-align: center;
            padding: 40px;
            color: #ef4444;
        }
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            .card img {
                height: 150px;
            }
            .card-content {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="grid">
            ${filteredPosts.map(post => `
                <div class="card">
                    ${post.pinned ? '<div class="pinned">Pinned</div>' : ''}
                    <img src="${post.images[0]?.url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop'}" alt="${post.title}">
                    <div class="card-content">
                        <h3>${post.title || 'Untitled'}</h3>
                        <div class="card-meta">
                            <span class="platform">${post.platform || 'Unknown'}</span>
                            <span class="status">${post.status || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
}
