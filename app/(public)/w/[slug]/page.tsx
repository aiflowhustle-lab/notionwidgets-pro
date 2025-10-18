'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
import { IPhone17Mockup } from '@/components/IPhone17Mockup';
import { Image, Loader2, AlertCircle, Smartphone, Monitor } from 'lucide-react';

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
  const [isMobileView, setIsMobileView] = useState(true);
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
      
      const queryParams = new URLSearchParams();
      if (currentFilters.platform) {
        queryParams.append('platform', currentFilters.platform);
      }
      if (currentFilters.status) {
        queryParams.append('status', currentFilters.status);
      }
      
      const url = `/api/widgets/${slug}/data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: forceRefresh ? 'no-cache' : 'default',
      });

      if (!response.ok) {
        throw new Error(`Failed to load widget: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Widget data loaded:', result);
      
      setData(result);
      setViewMode('all');
      setCurrentView('all');
    } catch (err) {
      console.error('Error loading widget data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widget');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [slug, filters]);

  const handleFiltersChange = useCallback((newFilters: WidgetFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    isFilterChanging.current = true;
    loadWidgetData(true, newFilters);
  }, [loadWidgetData]);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    loadWidgetData(true);
  }, [loadWidgetData]);

  const handleViewModeChange = useCallback((mode: 'all' | 'videos') => {
    console.log('View mode changed to:', mode);
    setViewMode(mode);
    setCurrentView(mode);
  }, []);

  // Check if we're in an iframe
  useEffect(() => {
    const checkIframe = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    };
    
    setIsInIframe(checkIframe());
  }, []);

  // Load widget data on mount
  useEffect(() => {
    loadWidgetData();
  }, [loadWidgetData]);

  // Filter posts based on current view
  const filteredPosts = data?.posts.filter(post => {
    if (currentView === 'videos') {
      return post.videos && post.videos.length > 0;
    }
    return true;
  }) || [];

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading widget</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => loadWidgetData(true)}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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

  const renderWidgetContent = () => (
    <div className="min-h-screen bg-white">
      {/* View Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileView(!isMobileView)}
          className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          title={isMobileView ? 'Switch to Desktop View' : 'Switch to Mobile View'}
        >
          {isMobileView ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filters */}
        <div className="max-w-3xl mx-auto mb-1">
          <FilterBar
            onFiltersChange={handleFiltersChange}
            availablePlatforms={availablePlatforms}
            availableStatuses={availableStatuses}
            currentFilters={filters}
            onRefresh={handleRefresh}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="max-w-3xl mx-auto mb-4 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('all')}
              className={`px-6 py-2 rounded-full transition-all ${
                currentView === 'all'
                  ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <span>All Posts</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('videos')}
              className={`px-6 py-2 rounded-full transition-all ${
                currentView === 'videos'
                  ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Videos</span>
              </div>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currentView === 'all' 
                ? 'Try adjusting your filters to see more content.'
                : currentView === 'videos' 
                  ? 'This widget doesn\'t have any videos yet.'
                  : 'This widget doesn\'t have any images yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

  if (isMobileView) {
    return (
      <IPhone17Mockup>
        {renderWidgetContent()}
      </IPhone17Mockup>
    );
  }

  return renderWidgetContent();
}
