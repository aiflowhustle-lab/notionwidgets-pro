import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { createWidget } from '@/lib/firestore';
import { testNotionConnection, detectDatabaseColumns } from '@/lib/notion';
import { generateSlug } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { CreateWidgetRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body: CreateWidgetRequest = await request.json();
    const { name, token: notionToken, databaseId, settings } = body;

    // Validate required fields
    if (!name || !notionToken || !databaseId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, token, databaseId' 
      }, { status: 400 });
    }

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
    const encryptedToken = await bcrypt.hash(notionToken, 10);

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
