'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [useIframe, setUseIframe] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Extract design ID from Canva URL
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  const designId = designIdMatch ? designIdMatch[1] : null;
  
  // Check if this is an embed URL with page parameter
  const isEmbedUrl = canvaUrl.includes('?embed');
  const pageMatch = canvaUrl.match(/[?&]page=(\d+)/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : 1;
  
  // Create a preview URL using Canva's embed format
  const previewUrl = designId 
    ? `https://www.canva.com/design/${designId}/view?embed${pageNumber > 1 ? `&page=${pageNumber}` : ''}`
    : canvaUrl;

  // Try Canva embed script approach first, fallback to iframe
  useEffect(() => {
    const checkIframeSupport = () => {
      // Check if we're in a nested iframe context (widget embedded in Notion)
      const inNestedIframe = window.self !== window.top && 
                            window.parent !== window.top;
      
      if (inNestedIframe) {
        console.log('Detected nested iframe context, using image fallback for Canva');
        setUseIframe(false);
        setImageError(true);
      }
    };

    checkIframeSupport();
  }, []);

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
        {!imageError && useIframe ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={title}
            onError={() => {
              console.log('Canva iframe failed, switching to fallback');
              setImageError(true);
              setUseIframe(false);
            }}
            sandbox="allow-scripts allow-same-origin allow-popups"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-pink-50">
            <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <ExternalLink className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Canva Design
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Click to view full design in Canva
            </p>
            <div className="text-xs text-orange-700 font-mono bg-orange-100 px-3 py-2 rounded-lg border border-orange-200">
              {designId ? `Design: ${designId}` : 'Canva Design'}
            </div>
            {pageNumber > 1 && (
              <div className="text-xs text-gray-500 mt-2">
                Page {pageNumber}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
