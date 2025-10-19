import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import DynamicWidgetPage from './DynamicWidgetPage';

interface WidgetPageProps {
  params: {
    slug: string;
  };
}

// Check if the request is from an iPad or mobile device
function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /iPad|iPhone|iPod|Android|Mobile|webOS|BlackBerry|IEMobile|Opera Mini|Tablet/i;
  return mobileRegex.test(userAgent);
}

// Check if the request is from Notion (iframe)
function isNotionRequest(userAgent: string, referer: string): boolean {
  return userAgent.includes('Notion') || 
         referer.includes('notion.so') || 
         referer.includes('notion.site') ||
         referer.includes('notion.com');
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  const { slug } = params;
  
  try {
    // Get request headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    
    // Check if this is a mobile/tablet device or Notion request
    const isMobile = isMobileDevice(userAgent);
    const isNotion = isNotionRequest(userAgent, referer);
    
    console.log('User Agent:', userAgent);
    console.log('Referer:', referer);
    console.log('Is Mobile:', isMobile);
    console.log('Is Notion:', isNotion);
    
    // If it's mobile/tablet or Notion, serve static HTML
    if (isMobile || isNotion) {
      console.log('Serving static version for mobile/Notion');
      return await StaticWidgetPage({ slug });
    }
    
    console.log('Serving dynamic version for desktop');
    
    // Otherwise, serve the dynamic React component
    return <DynamicWidgetPage slug={slug} />;
    
  } catch (error) {
    console.error('Error in widget page:', error);
    notFound();
  }
}

// Static HTML version for mobile/tablet/Notion
async function StaticWidgetPage({ slug }: { slug: string }) {
  try {
    // Fetch widget data from the existing API endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production'
      ? 'https://notionwidgets-pro-two.vercel.app'
      : 'http://localhost:3001';
    
    const apiUrl = `${baseUrl}/api/widgets/${slug}/data`;
    
    console.log('Fetching from API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Widget Not Found</h1>
              <p className="text-gray-600">The widget "{slug}" could not be found.</p>
            </div>
          </div>
        );
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const { widget, posts } = data;

    // Process all images and create HTML
    const allImages = posts.flatMap((post: any) => post.images);
    
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
              {allImages.map((img: any, index: number) => (
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