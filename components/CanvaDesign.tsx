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
  
  // Use Canva's actual embed URL that works in Notion and other devices
  const embedUrl = canvaUrl.includes('?') 
    ? canvaUrl 
    : `${canvaUrl}?embed`;

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
      <div className="relative w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 overflow-hidden">
        {!imageError ? (
          <div className="relative w-full h-full overflow-hidden">
            <iframe
              src={embedUrl}
              className="border-0 absolute inset-0"
              title={title}
              onError={() => setImageError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="lazy"
              style={{
                width: '120%',
                height: '120%',
                left: '-10%',
                top: '-10%',
                transform: 'scale(1)',
                transformOrigin: 'center center'
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-100 to-pink-100">
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
