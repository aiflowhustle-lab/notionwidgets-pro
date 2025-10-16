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
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Token verified for user:', decodedToken.uid);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    console.log('Attempting to delete widget with ID:', id);

    // Get widget to verify ownership
    const widget = await getWidgetById(id);
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
    await deleteWidget(id);
    console.log('Widget deleted successfully from Firestore');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
