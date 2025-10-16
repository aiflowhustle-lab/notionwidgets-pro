'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isInIframe, setIsInIframe] = useState(false);
  const isFilterChanging = useRef(false);
  const isLoadingRef = useRef(false);

  const loadWidgetData = useCallback(async (forceRefresh = false, currentFilters = filters) => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current && !forceRefresh) {
      console.log('Already loading, skipping duplicate request');
      return;
    }
    
    console.log('Loading widget data with filters:', currentFilters, 'forceRefresh:', forceRefresh);
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (currentFilters.platform) searchParams.set('platform', currentFilters.platform);
      if (currentFilters.status) searchParams.set('status', currentFilters.status);
      if (forceRefresh) searchParams.set('force_refresh', 'true');
      
      const apiUrl = `${window.location.origin}/api/widgets/${slug}/data?${searchParams.toString()}`;
      console.log('Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Widget not found');
        }
        throw new Error('Failed to load widget data');
      }
      
      const widgetData = await response.json();
      console.log('Received data:', widgetData);
      setData(widgetData);
    } catch (error) {
      console.error('Error loading widget data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load widget data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [slug]);

  // Load filters from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform') || '';
    const status = urlParams.get('status') || '';
    
    if (platform || status) {
      setFilters({
        platform: platform || undefined,
        status: status || undefined,
      });
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadWidgetData();
  }, [loadWidgetData]);

  // Load data when filters change (but not on initial mount)
  useEffect(() => {
    // Only load if we have actual filter values and we're not already loading
    if (!isLoadingRef.current && (filters.platform || filters.status)) {
      console.log('Filters changed, loading data with:', filters);
      loadWidgetData(false, filters);
    }
  }, [filters.platform, filters.status, loadWidgetData]);

  // Detect if we're in an iframe
  useEffect(() => {
    setIsInIframe(window !== window.top);
  }, []);

  const handleFiltersChange = (newFilters: WidgetFilters) => {
    console.log('Filter change requested:', newFilters);
    setFilters(newFilters);
    
    // Update URL parameters
    const url = new URL(window.location.href);
    if (newFilters.platform) {
      url.searchParams.set('platform', newFilters.platform);
    } else {
      url.searchParams.delete('platform');
    }
    
    if (newFilters.status) {
      url.searchParams.set('status', newFilters.status);
    } else {
      url.searchParams.delete('status');
    }
    
    console.log('Updating URL to:', url.toString());
    // Update URL without page refresh
    window.history.replaceState({}, '', url.toString());
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
              onRefresh={() => loadWidgetData(true)}
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
