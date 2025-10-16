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
    
    const { postOrder } = await request.json();
    console.log('Post order received:', postOrder);

    if (!postOrder || !Array.isArray(postOrder)) {
      return NextResponse.json(
        { error: 'Post order is required and must be an array' },
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

    // First, get all posts with their current dates
    const postsWithDates = await Promise.all(
      postOrder.map(async (postId: string) => {
        try {
          const page = await notion.pages.retrieve({ page_id: postId });
          const properties = (page as any).properties;
          
          // Get the current date from the post - try different property names
          const currentDate = properties.Date?.date?.start || 
                             properties['Publish Date']?.date?.start || 
                             properties['Publish date']?.date?.start ||
                             properties['publish_date']?.date?.start ||
                             null;
          console.log(`Post ${postId} current date:`, currentDate);
          console.log(`Post ${postId} available properties:`, Object.keys(properties));
          console.log(`Post ${postId} Date property:`, properties.Date);
          console.log(`Post ${postId} Publish Date property:`, properties['Publish Date']);
          
          return { postId, currentDate };
        } catch (error) {
          console.error(`Failed to get current date for post ${postId}:`, error);
          return { postId, currentDate: null };
        }
      })
    );
    
    console.log('All posts with dates:', postsWithDates);

    // Create a mapping of new positions to dates
    // The idea is to swap the dates based on the new order
    const dateMapping = new Map();
    
    // Get all the dates from the posts in their current order
    const allDates = postsWithDates.map(p => p.currentDate).filter(Boolean);
    console.log('All dates extracted:', allDates);
    
    // Map each post to its new date based on the reordered positions
    postOrder.forEach((postId, newIndex) => {
      // Find the original index of this post
      const originalIndex = postsWithDates.findIndex(p => p.postId === postId);
      
      if (originalIndex !== -1 && allDates[originalIndex]) {
        // The new date for this post should be the date that was at this new position originally
        const newDate = allDates[newIndex] || postsWithDates[originalIndex].currentDate;
        dateMapping.set(postId, newDate);
        console.log(`Mapping post ${postId} (was at index ${originalIndex}) to new date ${newDate} (at new index ${newIndex})`);
      }
    });
    
    console.log('Final date mapping:', Object.fromEntries(dateMapping));

    // Update each post with its new date
    const updates = postOrder.map(async (postId: string, newIndex: number) => {
      try {
        // Get the date that should be assigned to this position
        const newDate = dateMapping.get(postId);
        
        if (!newDate) {
          throw new Error('No date found for this post');
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

        console.log(`Successfully updated post ${postId} to date ${newDate}. Notion response:`, updateResponse);
        return { postId, newDate, success: true };
      } catch (error) {
        console.error(`Failed to update post ${postId}:`, error);
        return { 
          postId, 
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
