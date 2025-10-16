'use client';

import { Battery, Signal, Wifi } from "lucide-react";
import { useState, useEffect } from 'react';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';

interface PhoneMockupProps {
  widgetSlug: string;
}

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

export default function PhoneMockup({ widgetSlug }: PhoneMockupProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WidgetFilters>({});

  const loadWidgetData = async (forceRefresh = false, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (currentFilters.platform) searchParams.set('platform', currentFilters.platform);
      if (currentFilters.status) searchParams.set('status', currentFilters.status);
      if (forceRefresh) searchParams.set('force_refresh', 'true');
      
      const apiUrl = `${window.location.origin}/api/widgets/${widgetSlug}/data?${searchParams.toString()}`;
      
      const response = await fetch(apiUrl);
      
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
  };

  useEffect(() => {
    loadWidgetData();
  }, [widgetSlug]);

  const handleFiltersChange = (newFilters: WidgetFilters) => {
    setFilters(newFilters);
    loadWidgetData(false, newFilters);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e8e8] p-8">
      {/* iPhone Frame */}
      <div className="relative w-[390px] h-[844px] bg-white rounded-[60px] border-[14px] border-black shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-10" />

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-[54px] px-8 flex items-center justify-between text-black z-0">
          <div className="text-[15px] font-semibold">08:00</div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-[17px] h-[12px]" strokeWidth={2.5} />
            <Wifi className="w-[17px] h-[15px]" strokeWidth={2.5} />
            <Battery className="w-[27px] h-[13px]" strokeWidth={2.5} />
          </div>
        </div>

        {/* Screen Content Area - Widget Content */}
        <div className="absolute top-[54px] left-0 right-0 bottom-0 bg-white rounded-[46px] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading widget...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <p className="text-red-600 text-sm mb-2">Error loading widget</p>
                <p className="text-gray-500 text-xs">{error}</p>
              </div>
            </div>
          ) : data ? (
            <div className="h-full overflow-y-auto">
              {/* Widget Content */}
              <div className="p-3">
                {/* Filters */}
                <div className="mb-3">
                  <FilterBar
                    onFiltersChange={handleFiltersChange}
                    availablePlatforms={data.availablePlatforms}
                    availableStatuses={data.availableStatuses}
                    onRefresh={() => loadWidgetData(true)}
                    currentFilters={filters}
                  />
                </div>

                {/* Images Grid - Mobile optimized */}
                {data.posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="w-8 h-8 text-gray-400">📷</div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No images found</h3>
                    <p className="text-xs text-gray-600">
                      {Object.values(filters).some(v => v !== undefined)
                        ? 'Try adjusting your filters.'
                        : 'This widget doesn\'t have any images yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {data.posts.map((post) => (
                      <WidgetCard
                        key={post.id}
                        post={post}
                        aspectRatio={data.widget.settings?.aspectRatio || 'square'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
