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
      return new NextResponse('Widget Not Found\nThis widget doesn\'t exist or is not active.', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
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

    // Create plain text response
    const postsList = posts.map(post => 
      `• ${post.title} (${post.platform || 'Unknown'} - ${post.status || 'Unknown'})`
    ).join('\n');

    const text = `${widget.name}\nContent Gallery - NotionWidgets Pro\n\n${posts.length === 0 ? 'No content found' : postsList}`;

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Frame-Options': 'ALLOWALL',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error\nSomething went wrong', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'X-Frame-Options': 'ALLOWALL',
      },
    });
  }
}
