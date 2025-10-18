'use client';

import { useState, useEffect } from 'react';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from './WidgetCard';
import FilterBar from './FilterBar';

interface IPhone17MockupProps {
  className?: string;
  widgetSlug?: string;
}

export default function IPhone17Mockup({ className = "", widgetSlug = "demo" }: IPhone17MockupProps) {
  const [data, setData] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<WidgetFilters>({});
  const [viewMode, setViewMode] = useState<'all' | 'videos'>('all');

  // Mock data for demo
  useEffect(() => {
    const mockData = {
      widget: {
        id: "demo-widget",
        name: "Demo Widget",
        slug: widgetSlug,
        settings: { aspectRatio: 'square' },
        views: 1234
      },
      posts: [
        {
          id: "1",
          title: "Creative Design",
          platform: "Instagram",
          status: "Done",
          publishDate: new Date().toISOString(),
          images: [{ 
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop", 
            source: "link" as const,
            originalUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          videos: [],
          pinned: true,
          imageSource: "link"
        },
        {
          id: "2", 
          title: "Video Content",
          platform: "TikTok",
          status: "Done",
          publishDate: new Date().toISOString(),
          images: [],
          videos: [{ 
            url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            source: "link" as const,
            type: "video/mp4",
            thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          pinned: false,
          imageSource: "link"
        },
        {
          id: "3",
          title: "Brand Story",
          platform: "Instagram", 
          status: "In progress",
          publishDate: new Date().toISOString(),
          images: [{ 
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop", 
            source: "link" as const,
            originalUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          videos: [],
          pinned: false,
          imageSource: "link"
        },
        {
          id: "4",
          title: "Another Post",
          platform: "Instagram", 
          status: "Done",
          publishDate: new Date().toISOString(),
          images: [{ 
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop", 
            source: "link" as const,
            originalUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          videos: [],
          pinned: false,
          imageSource: "link"
        },
        {
          id: "5",
          title: "More Content",
          platform: "TikTok", 
          status: "Done",
          publishDate: new Date().toISOString(),
          images: [{ 
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop", 
            source: "link" as const,
            originalUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          videos: [],
          pinned: false,
          imageSource: "link"
        },
        {
          id: "6",
          title: "Final Post",
          platform: "Instagram", 
          status: "Not started",
          publishDate: new Date().toISOString(),
          images: [{ 
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop", 
            source: "link" as const,
            originalUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop"
          }],
          videos: [],
          pinned: false,
          imageSource: "link"
        }
      ],
      availablePlatforms: ["Instagram", "TikTok", "Others"],
      availableStatuses: ["Done", "In progress", "Not started"]
    };
    
    setData(mockData);
    setLoading(false);
  }, [widgetSlug]);

  const handleFiltersChange = (newFilters: WidgetFilters) => {
    setFilters(newFilters);
  };

  const handleViewChange = (view: 'all' | 'videos') => {
    setViewMode(view);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // Filter posts based on view mode
  const filteredPosts = data?.posts.filter(post => {
    if (viewMode === 'videos') {
      return post.videos && post.videos.length > 0;
    }
    return true;
  }) || [];

  return (
    <div className={`flex items-center justify-center bg-background ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* iPhone 17 Frame */}
        <div
          className="relative w-full h-full bg-black rounded-[60px] p-3 shadow-2xl"
          style={{ aspectRatio: "390/844" }}
        >
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-white rounded-[48px] overflow-hidden">
            {/* Dynamic Island */}
            

            {/* White space content area */}
            <div className="w-full h-full bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : data ? (
                <div className="p-4 space-y-4 h-full overflow-y-auto">
                  {/* Header */}
                  <div className="text-center">
                    <h1 className="text-lg font-bold text-black mb-1">
                      {data.widget.name}
                    </h1>
                    <p className="text-xs text-gray-600">
                      {data.widget.views} views
                    </p>
                  </div>

                  {/* Filter Bar */}
                  <FilterBar
                    onFiltersChange={handleFiltersChange}
                    availablePlatforms={data.availablePlatforms}
                    availableStatuses={data.availableStatuses}
                    onRefresh={handleRefresh}
                    onViewChange={handleViewChange}
                    currentFilters={filters}
                    className="scale-75 origin-top"
                  />

                  {/* View Toggle Icons */}
                  <div className="flex justify-center space-x-4 scale-75">
                    <button
                      onClick={() => handleViewChange('all')}
                      className={`p-2 transition-all flex items-center justify-center ${
                        viewMode === 'all'
                          ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)] scale-x-130'
                          : 'text-black hover:text-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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

                    <button
                      onClick={() => handleViewChange('videos')}
                      className={`p-2 transition-all flex items-center justify-center ${
                        viewMode === 'videos'
                          ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)] scale-x-130'
                          : 'text-black hover:text-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 50 50" fill="currentColor">
                        <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Widget Cards Grid */}
                  <div className="grid grid-cols-3 gap-1">
                    {filteredPosts.map((post) => (
                      <WidgetCard
                        key={post.id}
                        post={post}
                        aspectRatio={data.widget.settings?.aspectRatio || 'square'}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-0 top-[20%] w-1 h-12 bg-black rounded-r-sm" />
        <div className="absolute left-0 top-[30%] w-1 h-16 bg-black rounded-r-sm" />
        <div className="absolute left-0 top-[42%] w-1 h-16 bg-black rounded-r-sm" />
        <div className="absolute right-0 top-[28%] w-1 h-24 bg-black rounded-l-sm" />
      </div>
    </div>
  );
}
