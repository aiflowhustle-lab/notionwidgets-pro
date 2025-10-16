import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { adminAuth } from '@/lib/firebase-admin';
import { Client } from '@notionhq/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log('Reschedule request for slug:', slug);
    
    const { posts } = await request.json();
    console.log('Posts data received:', posts);

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Posts data is required and must be an array' },
        { status: 400 }
      );
    }

    // Get widget data
    const widget = await getWidget(slug);
    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Verify authentication (optional for public widgets)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);
      } catch (error) {
        console.error('Auth verification failed:', error);
        // For now, continue without auth for public widgets
      }
    }

    // Initialize Notion client
    const notion = new Client({
      auth: widget.token,
    });

    // First, let's check what properties are available in the first post
    if (posts.length > 0) {
      try {
        const firstPost = posts[0];
        console.log(`Checking properties for post ${firstPost.id}`);
        const page = await notion.pages.retrieve({ page_id: firstPost.id });
        const properties = (page as any).properties;
        console.log('Available properties:', Object.keys(properties));
        console.log('All properties:', JSON.stringify(properties, null, 2));
      } catch (error) {
        console.error('Failed to check properties:', error);
      }
    }

    // Update each post with its new date directly
    const updates = posts.map(async (post: { id: string; publishDate: string | null }) => {
      try {
        const { id: postId, publishDate: newDate } = post;
        
        if (!newDate) {
          console.warn(`No date provided for post ${postId}, skipping`);
          return { postId, success: false, error: 'No date provided' };
        }

        // Update the post in Notion with the new date
        console.log(`Attempting to update post ${postId} with new date ${newDate}`);
        
        const updateResponse = await notion.pages.update({
          page_id: postId,
          properties: {
            'Publish Date': {
              date: {
                start: newDate,
              },
            },
          },
        });

        console.log(`Successfully updated post ${postId} to date ${newDate}. Notion response:`, JSON.stringify(updateResponse, null, 2));
        return { postId, newDate, success: true };
      } catch (error) {
        console.error(`Failed to update post ${post.id}:`, error);
        console.error(`Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          postId: post.id,
          publishDate: post.publishDate
        });
        return { 
          postId: post.id, 
          error: error instanceof Error ? error.message : 'Unknown error', 
          success: false 
        };
      }
    });

    const results = await Promise.all(updates);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Successfully rescheduled ${successful.length} posts`,
      results: {
        successful,
        failed,
      },
    });

  } catch (error) {
    console.error('Error rescheduling posts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reschedule posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
