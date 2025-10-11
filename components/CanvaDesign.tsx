'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface CanvaDesignProps {
  canvaUrl: string;
  title: string;
  className?: string;
  onClick?: () => void;
  disableExternalLink?: boolean;
}

export default function CanvaDesign({ canvaUrl, title, className = '', onClick, disableExternalLink = false }: CanvaDesignProps) {
  const [imageError, setImageError] = useState(false);
  
  // Extract design ID from Canva URL
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  const designId = designIdMatch ? designIdMatch[1] : null;
  
  // Create a direct image URL using Canva's public API
  // This approach uses Canva's thumbnail/preview API that works without authentication
  const imageUrl = designId 
    ? `https://media.canva.com/1/image/${designId}/thumbnail.jpg`
    : null;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      // If onClick is provided, call it (this will handle gallery zoom)
      onClick();
    } else if (!disableExternalLink) {
      // Open Canva design in new tab only if external link is not disabled
      window.open(canvaUrl, '_blank');
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Canva Design Preview */}
      <div className="relative w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized // Canva images may not be optimized by Next.js
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-3">
              <ExternalLink className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 text-center mb-2">
              Canva Design
            </h3>
            <p className="text-xs text-gray-500 text-center mb-3">
              Click to view in Canva
            </p>
            <div className="text-xs text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded">
              {designId ? `ID: ${designId.substring(0, 8)}...` : 'Design Link'}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
