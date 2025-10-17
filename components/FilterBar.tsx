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
        <div className="btn-wrapper">
          <button 
            className="btn"
            onClick={onRefresh || (() => window.location.reload())}
          >
            <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              ></path>
            </svg>

            <div className="txt-wrapper">
              <div className="txt-1">
                <span className="btn-letter">R</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">f</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">s</span>
                <span className="btn-letter">h</span>
              </div>
              <div className="txt-2">
                <span className="btn-letter">R</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">f</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">s</span>
                <span className="btn-letter">h</span>
                <span className="btn-letter">i</span>
                <span className="btn-letter">n</span>
                <span className="btn-letter">g</span>
              </div>
            </div>
          </button>
        </div>

        {/* Filter Toggle Button */}
        <div className="btn-wrapper">
          <button 
            className="btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              ></path>
            </svg>

            <div className="txt-wrapper">
              <div className="txt-1">
                <span className="btn-letter">F</span>
                <span className="btn-letter">i</span>
                <span className="btn-letter">l</span>
                <span className="btn-letter">t</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">r</span>
              </div>
              <div className="txt-2">
                <span className="btn-letter">F</span>
                <span className="btn-letter">i</span>
                <span className="btn-letter">l</span>
                <span className="btn-letter">t</span>
                <span className="btn-letter">e</span>
                <span className="btn-letter">r</span>
                <span className="btn-letter">i</span>
                <span className="btn-letter">n</span>
                <span className="btn-letter">g</span>
              </div>
            </div>
          </button>
        </div>

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
