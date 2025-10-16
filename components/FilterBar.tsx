'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Filter } from 'lucide-react';
import { WidgetFilters } from '@/types';

interface FilterBarProps {
  onFiltersChange: (filters: WidgetFilters) => void;
  availablePlatforms: string[];
  availableStatuses: string[];
  onRefresh?: () => void;
  className?: string;
  currentFilters?: WidgetFilters;
}

export default function FilterBar({ 
  onFiltersChange, 
  availablePlatforms, 
  availableStatuses,
  onRefresh,
  className = '',
  currentFilters = {}
}: FilterBarProps) {
  const [filters, setFilters] = useState<WidgetFilters>(currentFilters);
  const [showFilters, setShowFilters] = useState(false);
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
          className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center space-x-1 ${
            showFilters 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Filters</span>
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
