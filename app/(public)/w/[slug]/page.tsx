'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
import { Image, Loader2, AlertCircle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  const [isDragMode, setIsDragMode] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const isFilterChanging = useRef(false);
  const isLoadingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && data) {
      const oldIndex = data.posts.findIndex((post) => post.id === active.id);
      const newIndex = data.posts.findIndex((post) => post.id === over?.id);

      const newPosts = arrayMove(data.posts, oldIndex, newIndex);
      
      setData({
        ...data,
        posts: newPosts
      });

      setHasChanges(true);
      console.log('Posts reordered:', { oldIndex, newIndex, newPosts });
    }
  };

  const handleReschedule = async () => {
    if (!data || !hasChanges) return;

    setIsRescheduling(true);
    try {
      const postOrder = data.posts.map(post => post.id);
      
      const token = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/widgets/${slug}/reschedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ postOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule posts');
      }

      const result = await response.json();
      console.log('Reschedule result:', result);
      
      // Reset changes and exit drag mode
      setHasChanges(false);
      setIsDragMode(false);
      
      // Reload widget data to show updated dates
      await loadWidgetData(true);
      
      // Show success message (you could add a toast notification here)
      alert('Posts successfully rescheduled!');
      
    } catch (error) {
      console.error('Error rescheduling posts:', error);
      alert('Failed to reschedule posts. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getAuthToken = async () => {
    // For public widgets, we might not need authentication
    // But if we do, we can get it from Firebase auth
    try {
      const { auth } = await import('@/lib/firebase');
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    // For now, return null to skip authentication
    return null;
  };

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
      {/* Header - Hidden */}
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Results - Aligned with grid */}
        <div className="max-w-3xl mx-auto">
          {/* Filters and Drag Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <FilterBar
                onFiltersChange={handleFiltersChange}
                availablePlatforms={availablePlatforms}
                availableStatuses={availableStatuses}
                onRefresh={() => loadWidgetData(true)}
                currentFilters={filters}
              />
              
              {/* Plan Grid and Reschedule Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDragMode(!isDragMode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDragMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isDragMode ? 'Plan Grid: ON' : 'Plan Grid'}
                </button>
                
                {isDragMode && hasChanges && (
                  <button
                    onClick={handleReschedule}
                    disabled={isRescheduling}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count - Hidden */}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={posts.map(post => post.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-1 max-w-3xl mx-auto">
                {posts.map((post) => (
                  <WidgetCard
                    key={post.id}
                    post={post}
                    aspectRatio={widget.settings?.aspectRatio || 'square'}
                    isDragMode={isDragMode}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
