import { notFound } from 'next/navigation';
import { getWidget } from '@/lib/firestore-admin';
import { decryptToken } from '@/lib/encryption';
import { fetchNotionDatabase } from '@/lib/notion';
import { NotionPost } from '@/types';

interface StaticWidgetPageProps {
  params: {
    slug: string;
  };
}

export default async function StaticWidgetPage({ params }: StaticWidgetPageProps) {
  const { slug } = params;
  
  try {
    // Fetch widget from Firestore
    const widget = await getWidget(slug);
    
    if (!widget) {
      notFound();
    }

    // Decrypt Notion token
    let decryptedToken: string;
    try {
      decryptedToken = decryptToken(widget.token);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600">Unable to decrypt widget credentials.</p>
          </div>
        </div>
      );
    }

    // Fetch data from Notion API
    let posts: NotionPost[];
    try {
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
    } catch (error) {
      console.error('Error fetching Notion data:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Error</h1>
            <p className="text-gray-600">Unable to fetch data from Notion.</p>
          </div>
        </div>
      );
    }

    // Process all images and create HTML
    const allImages = posts.flatMap(post => post.images);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{widget.name}</h1>
            <p className="text-gray-600">NotionWidgets Pro - iPad Compatible</p>
          </div>
          
          {/* Content */}
          {allImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📷</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Images Found</h2>
              <p className="text-gray-600">This widget doesn't have any images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((img, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <img 
                    src={img.url} 
                    alt={img.originalUrl || 'Image'} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
                    <div className="w-full p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <div className="text-white text-sm font-medium">
                        {img.source === 'canva' ? 'Canva Design' : 'Image'}
                      </div>
                      <div className="text-white text-xs opacity-90">
                        {img.source.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  } catch (error) {
    console.error('Unexpected error in static widget page:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">An unexpected error occurred while loading the widget.</p>
        </div>
      </div>
    );
  }
}

// Force this route to be dynamic
export const dynamic = 'force-dynamic';
