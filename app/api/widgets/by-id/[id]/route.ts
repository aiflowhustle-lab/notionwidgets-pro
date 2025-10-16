import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getWidgetById, deleteWidget } from '@/lib/firestore';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE request received for widget:', params.id);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Verify Firebase token
    let decodedToken;
    try {
      console.log('Verifying Firebase token...');
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Token verified for user:', decodedToken.uid);
    } catch (error) {
      console.log('Token verification failed:', error);
      console.log('Admin auth object:', typeof adminAuth, adminAuth);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    console.log('Attempting to delete widget with ID:', id);

    // Get widget to verify ownership
    console.log('Fetching widget from Firestore...');
    let widget;
    try {
      widget = await getWidgetById(id);
      console.log('Widget fetch result:', widget ? 'Found' : 'Not found');
    } catch (fetchError) {
      console.error('Error fetching widget:', fetchError);
      throw new Error(`Failed to fetch widget: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    if (!widget) {
      console.log('Widget not found:', id);
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    console.log('Widget found, userId:', widget.userId, 'Token uid:', decodedToken.uid);
    if (widget.userId !== decodedToken.uid) {
      console.log('User does not own this widget');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete widget
    console.log('Attempting to delete widget from Firestore...');
    try {
      await deleteWidget(id);
      console.log('Widget deleted successfully from Firestore');
    } catch (deleteError) {
      console.error('Firestore delete error:', deleteError);
      throw new Error(`Firestore delete failed: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
