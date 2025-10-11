import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { createWidget } from '@/lib/firestore-admin';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';
import { testNotionConnection, detectDatabaseColumns } from '@/lib/notion';
import { generateSlug, extractDatabaseId } from '@/lib/utils';
import { encryptToken } from '@/lib/encryption';
import { CreateWidgetRequest } from '@/types';
import { cacheService } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    console.log('Create widget API called');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token received, length:', token.length);
    
    // Verify Firebase token
    let decodedToken;
    try {
      console.log('Verifying Firebase token...');
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Token verified successfully for user:', decodedToken.uid);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body: CreateWidgetRequest = await request.json();
    const { name, token: notionToken, databaseId: rawDatabaseId, settings } = body;

    // Validate required fields
    if (!name || !notionToken || !rawDatabaseId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, token, databaseId' 
      }, { status: 400 });
    }

    // Extract clean database ID from URL if needed
    const databaseId = extractDatabaseId(rawDatabaseId);

    // Test Notion connection
    const isConnected = await testNotionConnection(notionToken, databaseId);
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Invalid Notion credentials or database not accessible' 
      }, { status: 400 });
    }

    // Detect database columns
    let columns;
    try {
      columns = await detectDatabaseColumns(notionToken, databaseId);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to detect database columns' 
      }, { status: 400 });
    }

    // Encrypt Notion token
    const encryptedToken = encryptToken(notionToken);

    // Generate unique slug
    const slug = generateSlug(name);

    // Create widget
    const widgetData = {
      name,
      token: encryptedToken,
      databaseId,
      slug,
      settings: settings || {},
    };

    const widgetId = await createWidget(decodedToken.uid, widgetData);

    // Invalidate cache for this widget (in case it was cached before)
    await cacheService.invalidate(widgetId);

    // Return widget data (without encrypted token)
    const widget = {
      id: widgetId,
      userId: decodedToken.uid,
      name,
      databaseId,
      slug,
      settings: widgetData.settings,
      views: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(widget);
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
