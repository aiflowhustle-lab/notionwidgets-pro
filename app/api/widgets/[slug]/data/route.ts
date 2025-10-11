import { NextRequest, NextResponse } from 'next/server';
import { getWidget, incrementWidgetViews } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';

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
    let posts;
    try {
      console.log('Attempting to fetch from Notion with token:', decryptedToken.substring(0, 10) + '...');
      console.log('Database ID:', widget.databaseId);
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
      console.log('Successfully fetched', posts.length, 'posts from Notion');
    } catch (error) {
      console.error('Error fetching from Notion:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback to mock data if Notion fails
      posts = [
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

    // Apply filters
    let filteredPosts = posts;
    if (platformFilter) {
      filteredPosts = filteredPosts.filter(post => post.platform === platformFilter);
    }
    if (statusFilter) {
      filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
    }

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
