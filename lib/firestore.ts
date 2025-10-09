import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Widget } from '@/types';

// User functions
export async function createUser(uid: string, userData: Omit<User, 'uid'>): Promise<void> {
  try {
    await addDoc(collection(db, 'users'), {
      uid,
      ...userData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function getUser(uid: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
}

// Widget functions
export async function createWidget(userId: string, widgetData: Omit<Widget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'widgets'), {
      userId,
      ...widgetData,
      views: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating widget:', error);
    throw new Error('Failed to create widget');
  }
}

export async function getWidget(slug: string): Promise<Widget | null> {
  try {
    const q = query(collection(db, 'widgets'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
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
    const docRef = doc(db, 'widgets', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
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
    console.error('Error getting widget by ID:', error);
    throw new Error('Failed to get widget');
  }
}

export async function getUserWidgets(userId: string): Promise<Widget[]> {
  try {
    const q = query(
      collection(db, 'widgets'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
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
  } catch (error) {
    console.error('Error getting user widgets:', error);
    throw new Error('Failed to get user widgets');
  }
}

export async function updateWidget(id: string, data: Partial<Widget>): Promise<void> {
  try {
    const docRef = doc(db, 'widgets', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating widget:', error);
    throw new Error('Failed to update widget');
  }
}

export async function deleteWidget(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'widgets', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw new Error('Failed to delete widget');
  }
}

export async function incrementWidgetViews(slug: string): Promise<void> {
  try {
    const q = query(collection(db, 'widgets'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        views: increment(1),
      });
    }
  } catch (error) {
    console.error('Error incrementing widget views:', error);
    // Don't throw error for view counting
  }
}
