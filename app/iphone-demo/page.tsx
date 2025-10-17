'use client';

import { IPhone17Mockup } from '@/components/IPhone17Mockup';
import { useState, useEffect } from 'react';
import { Widget } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';

// Mock data for demonstration
const mockWidget = {
  id: 'demo-widget',
  name: 'Demo Widget',
  slug: 'demo-widget',
  settings: {
    aspectRatio: 'square',
    gridColumns: 3
  },
  views: 0
};

const mockPosts = [
  {
    id: '1',
    title: 'Sample Instagram Post',
    platform: 'Instagram',
    status: 'Done',
    pinned: true,
    publishDate: new Date().toISOString(),
    imageSource: 'link',
    images: [{
      url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop',
      source: 'link',
      originalUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop'
    }],
    videos: []
  },
  {
    id: '2',
    title: 'Sample Video Post',
    platform: 'TikTok',
    status: 'In progress',
    pinned: false,
    publishDate: new Date().toISOString(),
    imageSource: 'link',
    images: [],
    videos: [{
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      source: 'link',
      originalUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    }]
  },
  {
    id: '3',
    title: 'Another Sample Post',
    platform: 'Instagram',
    status: 'Done',
    pinned: false,
    publishDate: new Date().toISOString(),
    imageSource: 'link',
    images: [{
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      source: 'link',
      originalUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop'
    }],
    videos: []
  }
];

export default function IPhoneDemoPage() {
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState<'all' | 'videos'>('all');

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleViewChange = (view: 'all' | 'videos') => {
    setViewMode(view);
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  const filteredPosts = mockPosts.filter(post => {
    if (viewMode === 'videos') {
      return post.videos && post.videos.length > 0;
    }
    return true;
  });

  return (
    <IPhone17Mockup>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Filters */}
          <div className="max-w-3xl mx-auto mb-1">
            <FilterBar
              onFiltersChange={handleFiltersChange}
              availablePlatforms={['Instagram', 'TikTok', 'Others']}
              availableStatuses={['Done', 'In progress', 'Not started']}
              onRefresh={handleRefresh}
              onViewChange={handleViewChange}
              currentFilters={filters}
            />
          </div>

          {/* View Toggle Icons - Between filters and cards */}
          <div className="max-w-6xl mx-auto mb-1 flex justify-between items-center px-4">
            {/* Grid Icon - Show All Cards (9 dots) - Third right of first card */}
            <div className="flex-1 flex justify-end">
              <button
                className={`p-2 transition-all flex items-center justify-center mr-5 ${
                  viewMode === 'all'
                    ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)] scale-x-130'
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
            </div>

            {/* Reels Icon - Show Only Videos - Third right of second card */}
            <div className="flex-1 flex justify-center">
              <button
                className={`p-2 transition-all flex items-center justify-center ${
                  viewMode === 'videos'
                    ? 'text-black shadow-[0_2px_0_0_rgba(0,0,0,1)] scale-x-130'
                    : 'text-black hover:text-gray-600'
                }`}
                title="Show only videos"
              >
                <svg className="w-6 h-6" viewBox="0 0 50 50" fill="currentColor">
                  <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
                </svg>
              </button>
            </div>

            {/* Empty space for third card */}
            <div className="flex-1"></div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-3 gap-1 max-w-3xl mx-auto">
            {filteredPosts.map((post) => (
              <WidgetCard
                key={post.id}
                post={post}
                aspectRatio={mockWidget.settings?.aspectRatio || 'square'}
              />
            ))}
          </div>
        </div>
      </div>
    </IPhone17Mockup>
  );
}
