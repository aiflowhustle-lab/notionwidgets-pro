import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  try {
    // Get widget data
    const widget = await getWidget(slug);
    if (!widget) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    // Fetch posts from Notion
    let posts = [];
    try {
      const decryptedToken = decryptToken(widget.token);
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
    } catch (error) {
      console.error('Error fetching from Notion:', error);
      // Use fallback data
      posts = getFallbackData();
    }

    // Limit posts for better performance
    const displayPosts = posts.slice(0, 9);

    // Generate completely static HTML (no JavaScript)
    const html = `<!DOCTYPE html>
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
            background: #ffffff;
            line-height: 1.4;
        }
        .container {
            max-width: 100%;
            margin: 0;
            padding: 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
            width: 100%;
        }
        .item {
            position: relative;
            aspect-ratio: 1;
            overflow: hidden;
            background: #f5f5f5;
        }
        .item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .item-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            color: white;
            padding: 8px;
            font-size: 11px;
            line-height: 1.2;
        }
        .item-title {
            font-weight: 500;
            margin-bottom: 2px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .item-meta {
            font-size: 9px;
            opacity: 0.8;
        }
        .platform-tag {
            display: inline-block;
            padding: 1px 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            font-size: 8px;
            margin-right: 3px;
        }
        .video-play {
            position: absolute;
            top: 6px;
            right: 6px;
            background: rgba(0,0,0,0.6);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #666;
            font-size: 14px;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 480px) {
            .grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .item-overlay {
                padding: 6px;
                font-size: 10px;
            }
        }
        
        /* iPad specific */
        @media (min-width: 768px) and (max-width: 1024px) {
            .grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="grid">
            ${displayPosts.map(post => {
                const hasVideo = post.videos && post.videos.length > 0;
                const imageUrl = post.images && post.images.length > 0 ? post.images[0].url : 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=300&fit=crop&auto=format';
                const title = post.title || 'Untitled';
                const platform = post.platform || 'Unknown';
                const date = post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                
                return `
                    <div class="item">
                        <img src="${imageUrl}" alt="${title}" loading="lazy">
                        ${hasVideo ? '<div class="video-play">▶</div>' : ''}
                        <div class="item-overlay">
                            <div class="item-title">${title}</div>
                            <div class="item-meta">
                                <span class="platform-tag">${platform}</span>
                                ${date}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *;",
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Error generating embed:', error);
    return new NextResponse('Error loading widget', { status: 500 });
  }
}

// Fallback data for when Notion API fails
function getFallbackData() {
  return [
    {
      id: '1',
      title: 'Instagram Post',
      publishDate: '2024-01-15',
      platform: 'Instagram',
      images: [{
        url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=300&fit=crop&auto=format',
        source: 'attachment'
      }],
      videos: []
    },
    {
      id: '2',
      title: 'TikTok Video',
      publishDate: '2024-01-14',
      platform: 'TikTok',
      images: [{
        url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=300&fit=crop&auto=format',
        source: 'link'
      }],
      videos: [{}] // Has video
    },
    {
      id: '3',
      title: 'Canva Design',
      publishDate: '2024-01-13',
      platform: 'Canva',
      images: [{
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop&auto=format',
        source: 'canva'
      }],
      videos: []
    },
    {
      id: '4',
      title: 'YouTube Thumbnail',
      publishDate: '2024-01-12',
      platform: 'YouTube',
      images: [{
        url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=300&fit=crop&auto=format',
        source: 'link'
      }],
      videos: [{}] // Has video
    },
    {
      id: '5',
      title: 'Pinterest Pin',
      publishDate: '2024-01-11',
      platform: 'Pinterest',
      images: [{
        url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=300&fit=crop&auto=format',
        source: 'link'
      }],
      videos: []
    },
    {
      id: '6',
      title: 'Facebook Post',
      publishDate: '2024-01-10',
      platform: 'Facebook',
      images: [{
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop&auto=format',
        source: 'attachment'
      }],
      videos: []
    }
  ];
}