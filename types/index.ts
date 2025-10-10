export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Widget {
  id: string;
  userId: string;
  name: string;
  token: string; // encrypted
  databaseId: string;
  slug: string;
  settings: {
    gridColumns?: number;
    defaultPlatform?: string;
    defaultStatus?: string;
    aspectRatio?: string;
  };
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotionPost {
  id: string;
  title: string;
  publishDate: string | null;
  platform: string | null;
  status: string | null;
  imageSource: string | null;
  images: NotionImage[];
  videos: NotionVideo[];
}

export interface NotionImage {
  url: string;
  source: 'attachment' | 'link' | 'canva';
  originalUrl?: string;
}

export interface NotionVideo {
  url: string;
  source: 'attachment' | 'link' | 'canva';
  originalUrl?: string;
  type: 'video/mp4' | 'video/webm' | 'video/ogg' | string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  id: string;
}

export interface CreateWidgetRequest {
  name: string;
  token: string;
  databaseId: string;
  settings?: {
    gridColumns?: number;
    defaultPlatform?: string;
    defaultStatus?: string;
    aspectRatio?: string;
  };
}

export interface WidgetFilters {
  platform?: string;
  status?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
