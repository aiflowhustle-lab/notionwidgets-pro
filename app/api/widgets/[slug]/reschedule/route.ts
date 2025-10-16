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
    const { postOrder } = await request.json();

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

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    // Initialize Notion client
    const notion = new Client({
      auth: widget.token,
    });

    // Update each post's date based on new order
    const updates = postOrder.map(async (postId: string, index: number) => {
      try {
        // Calculate new date (assuming posts are scheduled daily)
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + index);
        
        const newDate = baseDate.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Update the post in Notion
        await notion.pages.update({
          page_id: postId,
          properties: {
            // Assuming you have a 'Date' property in your Notion database
            'Date': {
              date: {
                start: newDate,
              },
            },
          },
        });

        console.log(`Updated post ${postId} to date ${newDate}`);
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
      { error: 'Failed to reschedule posts' },
      { status: 500 }
    );
  }
}
