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
  const [isInIframe, setIsInIframe] = useState(false);
  const [isIPadNotion, setIsIPadNotion] = useState(false);

  const loadWidgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (filters.platform) searchParams.set('platform', filters.platform);
      if (filters.status) searchParams.set('status', filters.status);
      
      const response = await fetch(`${window.location.origin}/api/widgets/${slug}/data?${searchParams.toString()}`);
      
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

  // Detect if we're in an iframe
  useEffect(() => {
    setIsInIframe(window !== window.top);
  }, []);

  // Detect iPad Notion app
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isInIframe = window !== window.top;
    const isNotionApp = window.location.href.includes('notion') || document.referrer.includes('notion');
    
    setIsIPadNotion(isIPad && isInIframe && isNotionApp);
  }, []);

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

  // Simplified iPad Notion app version
  if (isIPadNotion) {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#fff', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '100%'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '8px',
          maxWidth: '100%'
        }}>
          {posts.map((post) => {
            const mainImage = post.images?.[0];
            const mainVideo = post.videos?.[0];
            
            return (
              <div key={post.id} style={{
                position: 'relative',
                aspectRatio: '1',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer'
              }}>
                {mainVideo ? (
                  <video
                    src={mainVideo.url}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={mainImage?.url}
                  />
                ) : mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={post.title || 'Widget image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '12px'
                  }}>
                    No image
                  </div>
                )}
                
                {/* Simple overlay with title and date */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                  padding: '8px',
                  fontSize: '11px',
                  lineHeight: '1.2'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {post.title || 'Untitled'}
                  </div>
                  {post.publishDate && (
                    <div style={{ opacity: 0.8, fontSize: '10px' }}>
                      {new Date(post.publishDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {posts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No images found</div>
            <div style={{ fontSize: '14px' }}>This widget doesn't have any images yet.</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              onRefresh={loadWidgetData}
            />
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
