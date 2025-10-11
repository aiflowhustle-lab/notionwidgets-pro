'use client';

import { useState, useEffect } from 'react';
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
  const [isInIframe, setIsInIframe] = useState(false);
  
  // Detect if we're in an iframe (like when embedded in Notion)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInIframe(window.self !== window.top);
    }
  }, []);
  
  // Extract design ID from Canva URL
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  const designId = designIdMatch ? designIdMatch[1] : null;
  
  // Check if this is an embed URL with page parameter
  const isEmbedUrl = canvaUrl.includes('?embed');
  const pageMatch = canvaUrl.match(/[?&]page=(\d+)/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : 1;
  
  // Create a preview URL using Canva's Smart Embed format
  // This works better with Notion embedding
  const previewUrl = designId 
    ? `https://www.canva.com/design/${designId}/view?embed`
    : canvaUrl;

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
        {!imageError && !isInIframe ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={title}
            onError={() => setImageError(true)}
            sandbox="allow-scripts allow-same-origin allow-popups"
            allowFullScreen
            loading="lazy"
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
              {isInIframe ? 'Click to view in Canva (iframe restricted)' : 'Click to view in Canva'}
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
