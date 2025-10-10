import { NotionPost } from '@/types';
import SimpleWidgetCard from '@/components/SimpleWidgetCard';
import { Image } from 'lucide-react';

interface WidgetData {
  widget: {
    id: string;
    name: string;
    slug: string;
    settings: any;
    views: number;
  };
  posts: NotionPost[];
  availablePlatforms: string[];
  availableStatuses: string[];
}

function getMockWidgetData(slug: string): WidgetData {
  return {
    widget: {
      id: slug,
      name: 'Sample Widget',
      slug: slug,
      settings: { aspectRatio: 'square' },
      views: 0
    },
    posts: [
      {
        id: '1',
        title: 'Sample Image 1',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      },
      {
        id: '2',
        title: 'Sample Image 2',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      },
      {
        id: '3',
        title: 'Sample Image 3',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      },
      {
        id: '4',
        title: 'Sample Image 4',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      },
      {
        id: '5',
        title: 'Sample Image 5',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      },
      {
        id: '6',
        title: 'Sample Image 6',
        publishDate: new Date().toISOString(),
        platform: 'Instagram',
        status: 'Published',
        imageSource: 'attachment',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
            source: 'attachment' as const,
            originalUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
          }
        ],
        videos: []
      }
    ],
    availablePlatforms: ['Instagram', 'TikTok', 'YouTube'],
    availableStatuses: ['Published', 'Draft', 'Scheduled']
  };
}

export default function PublicWidgetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = getMockWidgetData(slug);
  const { widget, posts } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-4xl mx-auto">
      {/* Control Bar */}
      <div className="bg-gray-800 text-white rounded-t-lg -m-4 mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center space-x-1 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            {widget.name}
          </div>
        </div>
        </div>

        {/* Images Grid */}
      <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
          <SimpleWidgetCard
                key={post.id}
                post={post}
                aspectRatio={widget.settings?.aspectRatio || 'square'}
              />
            ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <span className="mr-1">🚀</span>
          <span>Powered by</span>
          <span className="ml-1 font-medium text-gray-700">NotionWidgets Pro</span>
        </div>
      </div>
    </div>
  );
}
