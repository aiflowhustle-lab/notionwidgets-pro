'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw, MoreHorizontal } from 'lucide-react';
import { WidgetFilters } from '@/types';

interface FilterBarProps {
  onFiltersChange: (filters: WidgetFilters) => void;
  availablePlatforms: string[];
  availableStatuses: string[];
  onRefresh?: () => void;
  className?: string;
}

export default function FilterBar({ 
  onFiltersChange, 
  availablePlatforms, 
  availableStatuses,
  onRefresh,
  className = '' 
}: FilterBarProps) {
  const [filters, setFilters] = useState<WidgetFilters>({});
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
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

        {/* Platform Filter - iPad Compatible */}
        <select
          value={filters.platform || ''}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
          className="px-2 sm:px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          style={{ WebkitAppearance: 'none', touchAction: 'manipulation' }}
        >
          <option value="">All Platforms</option>
          {availablePlatforms.map(platform => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        {/* Status Filter - iPad Compatible */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-2 sm:px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          style={{ WebkitAppearance: 'none', touchAction: 'manipulation' }}
        >
          <option value="">All Status</option>
          {availableStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Ellipsis Button */}
        <button className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.platform && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                Platform: {filters.platform}
                <button
                  onClick={() => handleFilterChange('platform', '')}
                  className="ml-1 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
