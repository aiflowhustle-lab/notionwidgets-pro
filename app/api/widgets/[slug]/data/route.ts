import { NextRequest, NextResponse } from 'next/server';
import { getWidget, incrementWidgetViews } from '@/lib/firestore-admin';
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
  // CORS headers for iframe embedding
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const platformFilter = searchParams.get('platform') || undefined;
    const statusFilter = searchParams.get('status') || undefined;

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404, headers });
    }

    // Check cache first
    let posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    
    if (!posts) {
      // Cache miss - fetch from Notion with rate limiting
      console.log('Cache miss - fetching from Notion');
      
      // Wait for rate limit availability
      await rateLimiter.waitForNextAvailable();
      
      // Check if we can make the request
      const canMakeRequest = await rateLimiter.canMakeRequest();
      if (!canMakeRequest) {
        console.log('Rate limit exceeded, using fallback data');
        posts = getFallbackData();
        // Cache the fallback data with current filters
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } else {
        // Decrypt the Notion token
        let decryptedToken: string;
        try {
          decryptedToken = decryptToken(widget.token);
        } catch (error) {
          console.error('Error decrypting token:', error);
          // Fallback to using token as-is for backward compatibility
          decryptedToken = widget.token;
        }
        
        // Fetch real data from Notion
        try {
          console.log('Attempting to fetch from Notion with token:', decryptedToken.substring(0, 10) + '...');
          console.log('Database ID:', widget.databaseId);
          
          // Record the request for rate limiting
          await rateLimiter.recordRequest();
          
          posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
          console.log('Successfully fetched', posts.length, 'posts from Notion');
          
          // Cache the result
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        } catch (error) {
          console.error('Error fetching from Notion:', error);
          console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
          // Fallback to mock data if Notion fails
          posts = getFallbackData();
          // Cache the fallback data with current filters
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        }
      }
    } else {
      console.log('Cache hit - using cached data');
    }

    // Apply filters
    let filteredPosts = posts;
    console.log('Before filtering - Total posts:', posts.length);
    console.log('Platform filter:', platformFilter);
    console.log('Status filter:', statusFilter);
    
    if (platformFilter) {
      filteredPosts = filteredPosts.filter(post => post.platform === platformFilter);
      console.log('After platform filter - Posts:', filteredPosts.length);
    }
    if (statusFilter) {
      filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
      console.log('After status filter - Posts:', filteredPosts.length);
    }
    
    console.log('Final filtered posts:', filteredPosts.length);

    // Increment view count (async, don't wait)
    // Temporarily disabled to prevent infinite loop
    // incrementWidgetViews(widget.id).catch(console.error);

    // Get available filter options
    const availablePlatforms = Array.from(new Set(posts.map(post => post.platform).filter(Boolean)));
    const availableStatuses = Array.from(new Set(posts.map(post => post.status).filter(Boolean)));

    return NextResponse.json({
      widget: {
        id: widget.id,
        name: widget.name,
        slug: widget.slug,
        settings: widget.settings,
        views: widget.views,
      },
      posts: filteredPosts,
      availablePlatforms,
      availableStatuses,
    }, { headers });
  } catch (error) {
    console.error('Error fetching widget data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
