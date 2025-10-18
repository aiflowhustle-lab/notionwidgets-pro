'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
import IPhone17Mockup from '@/components/IPhone17Mockup';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <IPhone17Mockup 
          className="w-full"
          widgetSlug={slug}
        />
      </div>
    </div>
  );
}
