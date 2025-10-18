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
    const displayPosts = posts.slice(0, 12);

    // Generate responsive HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${widget.name} - NotionWidgets Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8f9fa;
            line-height: 1.4;
        }
        .widget-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header h1 {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 12px;
            color: #666;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }
        .card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
            position: relative;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .card-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
            display: block;
        }
        .card-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            padding: 8px;
            font-size: 11px;
            line-height: 1.2;
        }
        .card-title {
            font-weight: 600;
            margin-bottom: 2px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-meta {
            font-size: 10px;
            opacity: 0.8;
        }
        .platform-badge {
            display: inline-block;
            padding: 2px 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            font-size: 9px;
            margin-right: 4px;
        }
        .video-indicator {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 14px;
        }
        .error {
            text-align: center;
            padding: 40px;
            color: #e74c3c;
            font-size: 14px;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
            }
            .card-image {
                height: 100px;
            }
            .card-overlay {
                padding: 6px;
                font-size: 10px;
            }
            .header h1 {
                font-size: 16px;
            }
        }
        
        /* iPad specific optimizations */
        @media (min-width: 768px) and (max-width: 1024px) {
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            }
            .card-image {
                height: 140px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="header">
            <h1>${widget.name}</h1>
            <p>${displayPosts.length} posts • Updated just now</p>
        </div>
        
        <div class="grid">
            ${displayPosts.map(post => `
                <div class="card">
                    ${post.images && post.images.length > 0 ? 
                        `<img src="${post.images[0].url}" alt="${post.title}" class="card-image" loading="lazy">` : 
                        `<div class="card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">No Image</div>`
                    }
                    ${post.videos && post.videos.length > 0 ? '<div class="video-indicator">▶</div>' : ''}
                    <div class="card-overlay">
                        <div class="card-title">${post.title || 'Untitled'}</div>
                        <div class="card-meta">
                            <span class="platform-badge">${post.platform || 'Unknown'}</span>
                            ${post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *;",
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
      title: 'Sample Instagram Post',
      publishDate: '2024-01-15',
      platform: 'Instagram',
      status: 'Done',
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
      status: 'In progress',
      images: [{
        url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=300&fit=crop&auto=format',
        source: 'link'
      }],
      videos: []
    },
    {
      id: '3',
      title: 'Canva Design',
      publishDate: '2024-01-13',
      platform: 'Canva',
      status: 'Done',
      images: [{
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop&auto=format',
        source: 'canva'
      }],
      videos: []
    }
  ];
}