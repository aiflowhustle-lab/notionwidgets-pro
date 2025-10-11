'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
import DebugInfo from '@/components/DebugInfo';
import { Image, Loader2, AlertCircle } from 'lucide-react';

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

export default function PublicWidgetPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WidgetFilters>({});
  const [isInIframe, setIsInIframe] = useState(false);

  // Detect if we're in an iframe context
  useEffect(() => {
    const checkIframe = () => {
      const inIframe = window.self !== window.top;
      const isNotionEmbed = window.location.search.includes('notion') || 
                           window.location.href.includes('notion') ||
                           document.referrer.includes('notion');
      
      setIsInIframe(inIframe || isNotionEmbed);
      
      console.log('Widget page context:', {
        inIframe,
        isNotionEmbed,
        pathname: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      });
    };

    // Check immediately and also after a short delay to catch iframe loading
    checkIframe();
    const timeout = setTimeout(checkIframe, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  const loadWidgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (filters.platform) searchParams.set('platform', filters.platform);
      if (filters.status) searchParams.set('status', filters.status);
      
      console.log('Loading widget data for slug:', slug);
      console.log('Filters:', filters);
      
      const response = await fetch(`/api/widgets/${slug}/data?${searchParams.toString()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Widget not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load widget data');
      }
      
      const widgetData = await response.json();
      console.log('Widget data loaded:', widgetData);
      console.log('Posts count:', widgetData.posts?.length || 0);
      
      // Log media information for debugging
      if (widgetData.posts) {
        widgetData.posts.forEach((post: any, index: number) => {
          console.log(`Post ${index + 1}: ${post.title}`);
          console.log(`  - Images: ${post.images?.length || 0}`);
          console.log(`  - Videos: ${post.videos?.length || 0}`);
          if (post.images) {
            post.images.forEach((img: any, imgIndex: number) => {
              console.log(`    Image ${imgIndex + 1}: ${img.source} - ${img.url?.substring(0, 50)}...`);
            });
          }
        });
      }
      
      setData(widgetData);
    } catch (error) {
      console.error('Error loading widget data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load widget data');
    } finally {
      setLoading(false);
    }
  }, [slug, filters.platform, filters.status]);

  useEffect(() => {
    loadWidgetData();
  }, [loadWidgetData]);

  const handleFiltersChange = (newFilters: WidgetFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Widget Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { widget, posts, availablePlatforms, availableStatuses } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{widget.name}</h1>
                <p className="text-sm text-gray-500">Image Gallery Widget</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">Powered by</div>
              <div className="text-sm font-medium text-gray-900">NotionWidgets Pro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info for iframe context */}
      {isInIframe && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <p className="font-bold">Debug: Running in iframe context</p>
          <p className="text-sm">This widget is embedded in Notion</p>
        </div>
      )}

      {/* Debug Information */}
      <DebugInfo posts={posts} isVisible={true} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Results - Aligned with grid */}
        <div className="max-w-4xl mx-auto">
          {/* Filters */}
          <div className="mb-6">
            <FilterBar
              onFiltersChange={handleFiltersChange}
              availablePlatforms={availablePlatforms}
              availableStatuses={availableStatuses}
            />
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {posts.length} {posts.length === 1 ? 'image' : 'images'}
              {Object.values(filters).some(v => v !== undefined) && ' (filtered)'}
            </p>
          </div>
        </div>

        {/* Images Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(v => v !== undefined)
                ? 'Try adjusting your filters to see more images.'
                : 'This widget doesn\'t have any images yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 max-w-4xl mx-auto">
            {posts.map((post) => (
              <WidgetCard
                key={post.id}
                post={post}
                aspectRatio={widget.settings?.aspectRatio || 'square'}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
