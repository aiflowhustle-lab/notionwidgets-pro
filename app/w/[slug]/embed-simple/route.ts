import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { NotionPost } from '@/types';

export const dynamic = 'force-dynamic';

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
      images: [],
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
      images: [],
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
      return new NextResponse(`<html><body><h1>Widget Not Found</h1><p>This widget doesn't exist or is not active.</p></body></html>`, {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
          'X-Frame-Options': 'ALLOWALL',
        },
      });
    }

    // Get posts
    let posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    
    if (!posts) {
      try {
        await rateLimiter.waitForNextAvailable();
        const canMakeRequest = await rateLimiter.canMakeRequest();
        
        if (!canMakeRequest) {
          posts = getFallbackData();
        } else {
          let decryptedToken: string;
          try {
            decryptedToken = decryptToken(widget.token);
          } catch (error) {
            decryptedToken = widget.token;
          }
          
          try {
            await rateLimiter.recordRequest();
            posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
          } catch (error) {
            posts = getFallbackData();
          }
        }
        
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } catch (error) {
        posts = getFallbackData();
      }
    }

    // Create ultra-simple HTML
    const postsList = posts.map(post => 
      `• ${post.title} (${post.platform || 'Unknown'} - ${post.status || 'Unknown'})`
    ).join('<br>');

    const html = `<html>
<head>
<meta charset="UTF-8">
<title>${widget.name}</title>
</head>
<body>
<h1>${widget.name}</h1>
<p>Content Gallery - NotionWidgets Pro</p>
${posts.length === 0 ? '<p>No content found</p>' : postsList}
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse(`<html><body><h1>Error</h1><p>Something went wrong</p></body></html>`, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL',
      },
    });
  }
}
