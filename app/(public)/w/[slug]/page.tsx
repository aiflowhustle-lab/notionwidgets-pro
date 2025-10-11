'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
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
  const [isInIframe, setIsInIframe] = useState(true); // Assume iframe by default for cleaner display

  const loadWidgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (filters.platform) searchParams.set('platform', filters.platform);
      if (filters.status) searchParams.set('status', filters.status);
      
      const response = await fetch(`/api/widgets/${slug}/data?${searchParams.toString()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Widget not found');
        }
        throw new Error('Failed to load widget data');
      }
      
      const widgetData = await response.json();
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

  // Always assume iframe for cleaner display in Notion
  // useEffect(() => {
  //   setIsInIframe(window !== window.top);
  // }, []);

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
    <div className="bg-white min-h-screen">
      {/* Widget Content - Always show for Iframely compatibility */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Widget Title */}
          <div className="mb-4 text-center">
            <h1 className="text-lg font-semibold text-gray-900">{widget.name}</h1>
            <p className="text-sm text-gray-500">Image Gallery Widget</p>
          </div>

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
            <div className="grid grid-cols-3 gap-1">
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
    </div>
  );
}
