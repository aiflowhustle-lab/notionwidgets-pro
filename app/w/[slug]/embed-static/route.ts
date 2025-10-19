import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { NotionPost } from '@/types';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Fallback data function
function getFallbackData(): NotionPost[] {
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

// Helper function to generate HTML for a single post
function generatePostHTML(post: NotionPost, aspectRatio: string = 'square'): string {
  const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';
  const imageUrl = post.images[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image';
  
  return `
    <div class="post-card">
      <div class="post-image ${aspectRatioClass}">
        <img src="${imageUrl}" alt="${post.title}" loading="lazy" />
        ${post.pinned ? '<div class="pinned-badge">📌</div>' : ''}
      </div>
      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <div class="post-meta">
          <span class="platform">${post.platform || 'Unknown'}</span>
          <span class="status">${post.status || 'Unknown'}</span>
        </div>
        ${post.publishDate ? `<div class="post-date">${new Date(post.publishDate).toLocaleDateString()}</div>` : ''}
      </div>
    </div>
  `;
}

// Helper function to generate the complete HTML
function generateWidgetHTML(widget: any, posts: NotionPost[]): string {
  const aspectRatio = widget.settings?.aspectRatio || 'square';
  const postsHTML = posts.map(post => generatePostHTML(post, aspectRatio)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${widget.name} - NotionWidgets Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: white;
            color: #111827;
            line-height: 1.5;
        }
        
        .widget-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .widget-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .widget-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #111827;
        }
        
        .widget-subtitle {
            font-size: 14px;
            color: #6b7280;
        }
        
        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .post-card {
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease;
        }
        
        .post-card:hover {
            transform: scale(1.02);
        }
        
        .post-image {
            position: relative;
            width: 100%;
            background: #f3f4f6;
        }
        
        .aspect-square {
            aspect-ratio: 1 / 1;
        }
        
        .aspect-video {
            aspect-ratio: 16 / 9;
        }
        
        .post-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        
        .pinned-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .post-content {
            padding: 15px;
        }
        
        .post-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #111827;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .post-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .platform, .status {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
        }
        
        .platform {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status {
            background: #dcfce7;
            color: #166534;
        }
        
        .post-date {
            font-size: 12px;
            color: #6b7280;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
        }
        
        .empty-state p {
            font-size: 14px;
        }
        
        @media (max-width: 640px) {
            .widget-container {
                padding: 15px;
            }
            
            .posts-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .post-content {
                padding: 12px;
            }
            
            .post-title {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="widget-header">
            <h1 class="widget-title">${widget.name}</h1>
            <p class="widget-subtitle">Content Gallery - NotionWidgets Pro</p>
        </div>
        
        ${posts.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon">📷</div>
                <h3>No content found</h3>
                <p>This widget doesn't have any content yet.</p>
            </div>
        ` : `
            <div class="posts-grid">
                ${postsHTML}
            </div>
        `}
    </div>
</body>
</html>`;
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

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      const errorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Not Found - NotionWidgets Pro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: white;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .error-container {
            text-align: center;
            padding: 40px;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .error-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #dc2626;
        }
        .error-message {
            font-size: 16px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">Widget Not Found</h1>
        <p class="error-message">This widget doesn't exist or is not active.</p>
    </div>
</body>
</html>`;
      
      return new NextResponse(errorHTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': "frame-ancestors *;",
          'X-Frame-Options': 'ALLOWALL',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Check cache first
    let posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    
    if (!posts) {
      // Cache miss - fetch from Notion with rate limiting
      try {
        // Wait for rate limit availability
        await rateLimiter.waitForNextAvailable();
        
        // Check if we can make the request
        const canMakeRequest = await rateLimiter.canMakeRequest();
        if (!canMakeRequest) {
          console.log('Rate limit exceeded, using fallback data');
          posts = getFallbackData();
        } else {
          // Decrypt the Notion token
          let decryptedToken: string;
          try {
            decryptedToken = decryptToken(widget.token);
          } catch (error) {
            console.error('Error decrypting token:', error);
            decryptedToken = widget.token;
          }
          
          // Fetch real data from Notion
          try {
            await rateLimiter.recordRequest();
            posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
            console.log('Successfully fetched', posts.length, 'posts from Notion');
          } catch (error) {
            console.error('Error fetching from Notion:', error);
            posts = getFallbackData();
          }
        }
        
        // Cache the result
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } catch (error) {
        console.error('Error in data fetching:', error);
        posts = getFallbackData();
      }
    }

    // Generate the HTML
    const html = generateWidgetHTML(widget, posts);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors *;",
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in embed-static route:', error);
    
    const errorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - NotionWidgets Pro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: white;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .error-container {
            text-align: center;
            padding: 40px;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .error-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #dc2626;
        }
        .error-message {
            font-size: 16px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">❌</div>
        <h1 class="error-title">Something went wrong</h1>
        <p class="error-message">Unable to load the widget. Please try again later.</p>
    </div>
</body>
</html>`;
    
    return new NextResponse(errorHTML, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors *;",
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
