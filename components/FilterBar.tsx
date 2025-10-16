'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(true);
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

        {/* Clear Filters Button */}
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

      {/* Active Filters Display - Hidden since dropdowns show current selection */}
    </div>
  );
}
