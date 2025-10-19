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

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      const errorHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Widget Not Found</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
<h1>Widget Not Found</h1>
<p>This widget doesn't exist or is not active.</p>
</body>
</html>`;
      
      return new NextResponse(errorHTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'ALLOWALL',
          'Cache-Control': 'public, max-age=300',
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

    // Generate simple HTML
    const postsHTML = posts.map(post => {
      const imageUrl = post.images[0]?.url || 'https://via.placeholder.com/200x200?text=No+Image';
      return `
        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; margin: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <img src="${imageUrl}" alt="${post.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${post.title}</h3>
              <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${post.platform || 'Unknown'}</span>
                <span style="background: #e8f5e8; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${post.status || 'Unknown'}</span>
              </div>
              ${post.publishDate ? `<div style="font-size: 12px; color: #666;">${new Date(post.publishDate).toLocaleDateString()}</div>` : ''}
            </div>
            ${post.pinned ? '<div style="color: #ff6b6b; font-size: 18px;">📌</div>' : ''}
          </div>
        </div>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${widget.name} - NotionWidgets Pro</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
      <h1 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">${widget.name}</h1>
      <p style="margin: 0; color: #666; font-size: 14px;">Content Gallery - NotionWidgets Pro</p>
    </div>
    
    ${posts.length === 0 ? `
      <div style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 16px;">📷</div>
        <h3 style="margin: 0 0 8px 0; color: #333;">No content found</h3>
        <p style="margin: 0;">This widget doesn't have any content yet.</p>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0;">
        ${postsHTML}
      </div>
    `}
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in embed-basic route:', error);
    
    const errorHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Error</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
<h1>Something went wrong</h1>
<p>Unable to load the widget. Please try again later.</p>
</body>
</html>`;
    
    return new NextResponse(errorHTML, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
