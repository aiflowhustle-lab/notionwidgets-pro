'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, BarChart3, Tag, Play, X, ChevronLeft, ChevronRight, Image as ImageIcon, Pin } from 'lucide-react';
import { NotionPost } from '@/types';
import { formatDate } from '@/lib/utils';
import CanvaDesign from './CanvaDesign';

interface WidgetCardProps {
  post: NotionPost;
  aspectRatio?: string;
}

export default function WidgetCard({ post, aspectRatio = 'square' }: WidgetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[2.4/3]'; // 20% width reduction (3 * 0.8 = 2.4)
      case 'landscape':
        return 'aspect-[3.2/2.4]'; // 20% width reduction (4 * 0.8 = 3.2)
      case 'auto':
        return 'aspect-auto';
      default:
        return 'aspect-[2.4/3]'; // 20% width reduction (3 * 0.8 = 2.4)
    }
  };

  const getPlatformColor = (platform: string | null) => {
    switch (platform) {
      case 'Instagram':
        return 'bg-pink-100 text-pink-800';
      case 'TikTok':
        return 'bg-black text-white';
      case 'Others':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string | null) => {
    switch (source) {
      case 'attachment':
        return 'bg-blue-100 text-blue-800';
      case 'link':
        return 'bg-purple-100 text-purple-800';
      case 'canva':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if ((!post.images || post.images.length === 0) && (!post.videos || post.videos.length === 0)) {
    return null;
  }

  const mainImage = post.images?.[0];
  const mainVideo = post.videos?.[0];
  const hasVideo = post.videos && post.videos.length > 0;
  const hasImage = post.images && post.images.length > 0;

  const handleMediaClick = () => {
    if (hasVideo) {
      setSelectedMedia(mainVideo.url);
      setMediaType('video');
      setIsGalleryOpen(true);
    } else if (hasImage) {
      setSelectedMedia(mainImage.url);
      setMediaType('image');
      setCurrentImageIndex(0);
      setIsGalleryOpen(true);
    }
  };

  const allMedia = [
    ...(post.images || []).map(img => ({ ...img, type: 'image' as const })),
    ...(post.videos || []).map(vid => ({ ...vid, type: 'video' as const }))
  ];

  const hasMultipleMedia = allMedia.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allMedia.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === allMedia.length - 1 ? 0 : prev + 1
    );
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedMedia(null);
    setMediaType(null);
    setCurrentImageIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
      }
    };

    if (isGalleryOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isGalleryOpen, currentImageIndex, allMedia.length]);

  return (
    <>
      <div className="group cursor-pointer" onClick={handleMediaClick}>
        <div className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Media (Image or Video) */}
          <div className={`relative ${getAspectRatioClass()} overflow-hidden`}>
            {/* Pinned Icon */}
            {post.pinned && (
              <div className="absolute top-2 right-2 z-10">
                <div className="text-white">
                  <Pin className="w-4 h-4 fill-current rotate-45 scale-110" />
                </div>
              </div>
            )}

            {/* Select All Icon - Show on all cards except videos */}
            {!hasVideo && (
              <div className="absolute top-2 left-2 z-10">
                <div className="text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" data-iconid="select-all-off" data-svgname="Select all off">
                    <title>ic_fluent_select_all_off_24_filled</title>
                    <desc>Created with Sketch.</desc>
                    <g id="🔍-Product-Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="ic_fluent_select_all_off_24_filled" fill="currentColor" fillRule="nonzero">
                            <path d="M20.4961766,5.62668182 C21.3720675,5.93447702 22,6.76890777 22,7.75 L22,17.75 C22,20.0972102 20.0972102,22 17.75,22 L7.75,22 C6.76890777,22 5.93447702,21.3720675 5.62668182,20.4961766 L7.72396188,20.4995565 L17.75,20.5 C19.2687831,20.5 20.5,19.2687831 20.5,17.75 L20.5,7.75 L20.4960194,7.69901943 L20.4961766,5.62668182 Z M17.246813,2 C18.4894537,2 19.496813,3.00735931 19.496813,4.25 L19.496813,17.246813 C19.496813,18.4894537 18.4894537,19.496813 17.246813,19.496813 L4.25,19.496813 C3.00735931,19.496813 2,18.4894537 2,17.246813 L2,4.25 C2,3.00735931 3.00735931,2 4.25,2 L17.246813,2 Z" id="🎨-Color"></path>
                        </g>
                    </g>
                  </svg>
                </div>
              </div>
            )}

            {/* Reels Icon - Show on videos only */}
            {hasVideo && (
              <div className="absolute top-2 left-2 z-10">
                <div className="text-white">
                  <svg className="w-4 h-4 scale-110" viewBox="0 0 50 50" fill="currentColor">
                    <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
                  </svg>
                </div>
              </div>
            )}
            {hasVideo ? (
              // Video display with proper thumbnail
              <div className="relative w-full h-full">
                <video
                  src={mainVideo.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={post.images?.[0]?.url || undefined}
                  onLoadedMetadata={(e) => {
                    // Set video to first frame for thumbnail
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 0.1;
                  }}
                />
                {/* Play button overlay - Hidden */}
                {/* <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div> */}
              </div>
            ) : hasImage && !imageError ? (
              // Image display
              mainImage.source === 'canva' ? (
                <CanvaDesign
                  canvaUrl={mainImage.originalUrl || mainImage.url}
                  title={post.title}
                  className="w-full h-full"
                  onClick={handleMediaClick}
                />
              ) : (
                <Image
                  src={mainImage.url}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Media not available</span>
              </div>
            )}
            
            {/* Overlay with content on hover - Bottom 20% */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300">
              {/* Title and date overlay - Bottom 20% of card */}
              <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black h-[20%] flex flex-col justify-center p-4 z-10">
                <div className="text-white">
                  <div className="text-xs text-white/70 mb-1">
                    {post.publishDate ? formatDate(post.publishDate) : 'No date'}
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2">
                    {post.title || 'Untitled'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Top-right icon and media count - Hidden */}
            {/* <div className="absolute top-2 right-2 flex gap-2">
              {hasMultipleMedia && (
                <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  {allMedia.length}
                </div>
              )}
              <div className="w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                {hasVideo ? (
                  <Play className="w-3 h-3 text-gray-600" />
                ) : (
                  <ImageIcon className="w-3 h-3 text-gray-600" />
                )}
              </div>
            </div> */}
          </div>


        </div>
      </div>

      {/* Enhanced Gallery Modal */}
      {isGalleryOpen && allMedia.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={closeGallery}
        >
          <div className="max-w-7xl max-h-[90vh] w-full relative">
            {/* Header with counter and close button in top right */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <div className="bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {allMedia.length}
              </div>
              <button
                onClick={closeGallery}
                className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main media display */}
            <div className="relative h-[85vh] flex items-center justify-center">
              {allMedia[currentImageIndex]?.type === 'video' ? (
                <video
                  src={allMedia[currentImageIndex].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                allMedia[currentImageIndex]?.source === 'canva' ? (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-full"
                  >
                    <CanvaDesign
                      canvaUrl={allMedia[currentImageIndex].originalUrl || allMedia[currentImageIndex].url}
                      title={post.title}
                      className="w-full h-full"
                      disableExternalLink={true}
                    />
                  </div>
                ) : (
                  <Image
                    src={allMedia[currentImageIndex].url}
                    alt={post.title}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                )
              )}
            </div>

            {/* Navigation arrows */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail strip - Hidden */}

            {/* Media Info - Title hidden */}
          </div>
        </div>
      )}
    </>
  );
}
