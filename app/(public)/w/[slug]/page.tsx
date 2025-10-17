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
  const [viewMode, setViewMode] = useState<'all' | 'videos'>('all');
  const [currentView, setCurrentView] = useState<'all' | 'videos'>('all');
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

  // Detect if we're in an iframe
  useEffect(() => {
    setIsInIframe(window !== window.top);
  }, []);

  const handleFiltersChange = (newFilters: WidgetFilters) => {
    console.log('Filter change requested:', newFilters);
    
    // Only proceed if filters actually changed
    const currentPlatform = filters.platform || '';
    const currentStatus = filters.status || '';
    const newPlatform = newFilters.platform || '';
    const newStatus = newFilters.status || '';
    
    if (currentPlatform === newPlatform && currentStatus === newStatus) {
      console.log('Filters unchanged, skipping update');
      return;
    }
    
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
    
    // Immediately load data with new filters
    console.log('Loading data immediately with new filters:', newFilters);
    loadWidgetData(false, newFilters);
  };

  const handleViewChange = (view: 'all' | 'videos') => {
    setViewMode(view);
    setCurrentView(view);
  };

  // Filter posts based on view mode
  const filteredPosts = data?.posts.filter(post => {
    if (viewMode === 'videos') {
      return post.videos && post.videos.length > 0;
    }
    return true; // Show all posts for 'all' view
  }) || [];

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
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filters */}
        <div className="max-w-3xl mx-auto mb-6">
          <FilterBar
            onFiltersChange={handleFiltersChange}
            availablePlatforms={availablePlatforms}
            availableStatuses={availableStatuses}
            onRefresh={() => loadWidgetData(true)}
            onViewChange={handleViewChange}
            currentFilters={filters}
          />
        </div>

        {/* View Toggle Icons - Between filters and cards */}
        <div className="max-w-3xl mx-auto mb-1 flex justify-center items-center">
          {/* Grid Icon - Show All Cards (9 dots) - Right side */}
          <button
            onClick={() => handleViewChange('all')}
            className={`p-2 transition-all flex items-center justify-center mr-16 ${
              currentView === 'all'
                ? 'text-black shadow-[0_4px_0_0_rgba(0,0,0,1)]'
                : 'text-black hover:text-gray-600'
            }`}
            title="Show all cards"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="5" height="5"/>
              <rect x="9.5" y="2" width="5" height="5"/>
              <rect x="17" y="2" width="5" height="5"/>
              <rect x="2" y="9.5" width="5" height="5"/>
              <rect x="9.5" y="9.5" width="5" height="5"/>
              <rect x="17" y="9.5" width="5" height="5"/>
              <rect x="2" y="17" width="5" height="5"/>
              <rect x="9.5" y="17" width="5" height="5"/>
              <rect x="17" y="17" width="5" height="5"/>
            </svg>
          </button>

          {/* Reels Icon - Show Only Videos - Center */}
          <button
            onClick={() => handleViewChange('videos')}
            className={`p-2 transition-all flex items-center justify-center ${
              currentView === 'videos'
                ? 'text-black shadow-[0_4px_0_0_rgba(0,0,0,1)]'
                : 'text-black hover:text-gray-600'
            }`}
            title="Show only videos"
          >
            <svg className="w-6 h-6" viewBox="0 0 50 50" fill="currentColor">
              <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
            </svg>
          </button>
        </div>

        {/* Content Grid - 2x3 Layout */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewMode === 'videos' ? 'No videos found' : 'No images found'}
            </h3>
            <p className="text-gray-600">
              {Object.values(filters).some(v => v !== undefined)
                ? 'Try adjusting your filters to see more content.'
                : viewMode === 'videos' 
                  ? 'This widget doesn\'t have any videos yet.'
                  : 'This widget doesn\'t have any images yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 max-w-3xl mx-auto">
            {filteredPosts.map((post) => (
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
