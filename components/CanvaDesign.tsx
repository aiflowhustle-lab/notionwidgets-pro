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
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extract design ID from Canva URL
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  const designId = designIdMatch ? designIdMatch[1] : null;
  
  // Check if this is a direct image URL with page parameter
  const isImageUrl = canvaUrl.includes('format=png') || canvaUrl.includes('format=jpg');
  const pageMatch = canvaUrl.match(/[?&]page=(\d+)/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : 1;

  // Detect iframe context
  useEffect(() => {
    const checkIframe = () => {
      const inIframe = window.self !== window.top;
      const isNotionEmbed = window.location.search.includes('notion') || 
                           window.location.href.includes('notion') ||
                           document.referrer.includes('notion');
      
      setIsInIframe(inIframe || isNotionEmbed);
    };

    checkIframe();
  }, []);

  // Process Canva design on server-side if in iframe context
  useEffect(() => {
    if (isInIframe && designId && !isImageUrl && !processedImageUrl && !isProcessing) {
      processCanvaDesign();
    }
  }, [isInIframe, designId, isImageUrl, processedImageUrl, isProcessing]);

  const processCanvaDesign = async () => {
    if (!designId) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/canva/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          pageNumber,
          originalUrl: canvaUrl,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setProcessedImageUrl(data.imageUrl);
        console.log(`Processed Canva design ${designId} page ${pageNumber}:`, data.cached ? 'cached' : 'fresh');
      } else {
        console.error('Failed to process Canva design:', data.error);
        setImageError(true);
      }
    } catch (error) {
      console.error('Error processing Canva design:', error);
      setImageError(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Determine which URL to use
  const getImageUrl = () => {
    if (isImageUrl) {
      return canvaUrl; // Already a direct image URL
    }
    
    if (isInIframe && processedImageUrl) {
      return processedImageUrl; // Server-processed image
    }
    
    if (isInIframe) {
      return null; // Still processing, show loading
    }
    
    // Direct web context - use iframe embed
    return designId 
      ? `https://www.canva.com/design/${designId}/view?embed${pageNumber > 1 ? `&page=${pageNumber}` : ''}`
      : canvaUrl;
  };

  const imageUrl = getImageUrl();

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
        {!imageError && imageUrl ? (
          isInIframe ? (
            // Iframe context - use img tag
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            // Direct web context - use iframe
            <iframe
              src={imageUrl}
              className="w-full h-full border-0"
              title={title}
              onError={() => setImageError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )
        ) : isProcessing ? (
          // Loading state for server processing
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-gray-500 text-center">Processing Canva design...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-3">
              <ExternalLink className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 text-center mb-2">
              Canva Design
            </h3>
            <p className="text-xs text-gray-500 text-center mb-3">
              Canva Design
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
