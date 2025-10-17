'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Filter } from 'lucide-react';
import { WidgetFilters } from '@/types';

interface FilterBarProps {
  onFiltersChange: (filters: WidgetFilters) => void;
  availablePlatforms: string[];
  availableStatuses: string[];
  onRefresh?: () => void;
  onViewChange?: (view: 'all' | 'videos') => void;
  className?: string;
  currentFilters?: WidgetFilters;
}

export default function FilterBar({ 
  onFiltersChange, 
  availablePlatforms, 
  availableStatuses,
  onRefresh,
  onViewChange,
  className = '',
  currentFilters = {}
}: FilterBarProps) {
  const [filters, setFilters] = useState<WidgetFilters>(currentFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<'all' | 'videos'>('all');
  const isInitialMount = useRef(true);

  // Sync internal state with currentFilters prop
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    // Skip the initial mount to prevent empty filter calls
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof WidgetFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleViewChange = (view: 'all' | 'videos') => {
    setCurrentView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-3">
        {/* Refresh Button */}
        <button
          onClick={onRefresh || (() => window.location.reload())}
          className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Refresh</span>
        </button>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
            showFilters 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="Filters"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Clear Filters Button - Always visible when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-1 ml-2">
          {/* Grid Icon - Show All Cards */}
          <button
            onClick={() => handleViewChange('all')}
            className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
              currentView === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Show all cards"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>

          {/* Reels Icon - Show Only Videos */}
          <button
            onClick={() => handleViewChange('videos')}
            className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
              currentView === 'videos'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Show only videos"
          >
            <svg className="w-4 h-4" viewBox="0 0 50 50" fill="currentColor">
              <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Filter Dropdowns */}
      {showFilters && (
        <div className="mt-4 flex items-center space-x-3">
          {/* Platform Filter */}
          <select
            value={filters.platform || ''}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          >
            <option value="">All Platforms</option>
            {availablePlatforms.map(platform => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          >
            <option value="">All Status</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
