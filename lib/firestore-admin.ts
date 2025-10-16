import { adminDb } from './firebase-admin';
import { User, Widget } from '@/types';

// User functions
export async function createUser(uid: string, userData: Omit<User, 'uid'>): Promise<void> {
  try {
    await adminDb.collection('users').doc(uid).set({
      ...userData,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function getUser(uid: string): Promise<User | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    return {
      uid,
      email: userData?.email || '',
      displayName: userData?.displayName,
      photoURL: userData?.photoURL,
      createdAt: userData?.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Widget functions
export async function createWidget(userId: string, widgetData: Omit<Widget, 'id' | 'userId' | 'views' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await adminDb.collection('widgets').add({
      userId,
      ...widgetData,
      views: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating widget:', error);
    throw new Error('Failed to create widget');
  }
}

export async function getWidget(slug: string): Promise<Widget | null> {
  try {
    const snapshot = await adminDb.collection('widgets')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      token: data.token,
      databaseId: data.databaseId,
      slug: data.slug,
      settings: data.settings || {},
      views: data.views || 0,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting widget:', error);
    throw new Error('Failed to get widget');
  }
}

export async function getWidgetById(id: string): Promise<Widget | null> {
  try {
    const docRef = adminDb.collection('widgets').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data?.userId,
      name: data?.name,
      token: data?.token,
      databaseId: data?.databaseId,
      slug: data?.slug,
      settings: data?.settings || {},
      views: data?.views || 0,
      isActive: data?.isActive,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting widget by ID:', error);
    throw new Error('Failed to get widget');
  }
}

export async function getUserWidgets(userId: string): Promise<Widget[]> {
  try {
    const snapshot = await adminDb.collection('widgets')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const widgets = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        token: data.token,
        databaseId: data.databaseId,
        slug: data.slug,
        settings: data.settings || {},
        views: data.views || 0,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    
    return widgets.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting user widgets:', error);
    throw new Error('Failed to get user widgets');
  }
}

export async function updateWidget(widgetId: string, updates: Partial<Widget>): Promise<void> {
  try {
    await adminDb.collection('widgets').doc(widgetId).update({
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating widget:', error);
    throw new Error('Failed to update widget');
  }
}

export async function deleteWidget(widgetId: string): Promise<void> {
  try {
    await adminDb.collection('widgets').doc(widgetId).delete();
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw new Error('Failed to delete widget');
  }
}

export async function incrementWidgetViews(widgetId: string): Promise<void> {
  try {
    const { FieldValue } = require('firebase-admin/firestore');
    await adminDb.collection('widgets').doc(widgetId).update({
      views: FieldValue.increment(1),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error incrementing widget views:', error);
    throw new Error('Failed to increment widget views');
  }
}
