import { NotionPost } from '@/types';

// Static widget data for testing
const mockWidget = {
  id: 'test-widget',
  name: 'Test Widget',
  slug: 'test-widget',
  settings: { aspectRatio: 'square' },
  views: 0,
};

const mockPosts: NotionPost[] = [
  {
    id: '1',
    title: 'Sample Image 1',
    platform: 'Instagram',
    status: 'Published',
    publishDate: new Date(),
    images: [
      {
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=500&fit=crop&auto=format',
        source: 'link',
        originalUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=500&fit=crop&auto=format',
      }
    ],
    videos: [],
  },
  {
    id: '2',
    title: 'Sample Image 2',
    platform: 'Twitter',
    status: 'Draft',
    publishDate: new Date(),
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop&auto=format',
        source: 'link',
        originalUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop&auto=format',
      }
    ],
    videos: [],
  },
];

export default function StaticWidgetPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Static Widget Test</h1>
        <div className="grid grid-cols-3 gap-4">
          {mockPosts.map((post) => (
            <div key={post.id} className="bg-gray-100 rounded-lg p-4">
              <img 
                src={post.images[0].url} 
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
              <h3 className="font-medium text-gray-900">{post.title}</h3>
              <p className="text-sm text-gray-600">{post.platform}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
