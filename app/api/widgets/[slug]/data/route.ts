import { NextRequest, NextResponse } from 'next/server';
import { getWidget, incrementWidgetViews } from '@/lib/firestore';
import { fetchNotionDatabase } from '@/lib/notion';
import bcrypt from 'bcryptjs';

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
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Note: In a real implementation, you would decrypt the token here
    // For now, we'll assume the token is stored in plain text for demo purposes
    // In production, you should decrypt it: const decryptedToken = await bcrypt.compare(originalToken, widget.token);
    
    // For demo purposes, we'll return mock data
    // In production, you would fetch from Notion:
    // const posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
    
    const mockPosts = [
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
        ]
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
        ]
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
        ]
      }
    ];

    // Apply filters
    let filteredPosts = mockPosts;
    if (platformFilter) {
      filteredPosts = filteredPosts.filter(post => post.platform === platformFilter);
    }
    if (statusFilter) {
      filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
    }

    // Increment view count (async, don't wait)
    incrementWidgetViews(slug).catch(console.error);

    // Get available filter options
    const availablePlatforms = [...new Set(mockPosts.map(post => post.platform).filter(Boolean))];
    const availableStatuses = [...new Set(mockPosts.map(post => post.status).filter(Boolean))];

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
    });
  } catch (error) {
    console.error('Error fetching widget data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
