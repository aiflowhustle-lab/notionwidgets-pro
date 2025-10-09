'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Calendar, BarChart3, Tag } from 'lucide-react';
import { NotionPost } from '@/types';
import { formatDate } from '@/lib/utils';

interface WidgetCardProps {
  post: NotionPost;
  aspectRatio?: string;
}

export default function WidgetCard({ post, aspectRatio = 'square' }: WidgetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'auto':
        return 'aspect-auto';
      default:
        return 'aspect-square';
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

  if (post.images.length === 0) {
    return null;
  }

  const mainImage = post.images[0];

  return (
    <>
      <div className="masonry-item group cursor-pointer" onClick={() => setSelectedImage(mainImage.url)}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className={`relative ${getAspectRatioClass()} overflow-hidden`}>
            {!imageError ? (
              <Image
                src={mainImage.url}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Image not available</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.platform && (
                <span className={`px-2 py-1 text-xs rounded-full ${getPlatformColor(post.platform)}`}>
                  {post.platform}
                </span>
              )}
              {post.status && (
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
              )}
              {post.imageSource && (
                <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(post.imageSource)}`}>
                  {post.imageSource}
                </span>
              )}
            </div>

            {/* Date */}
            {post.publishDate && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.publishDate)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <div className="relative">
              <Image
                src={selectedImage}
                alt={post.title}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Image Info */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <div className="flex justify-center space-x-4 text-sm">
                {post.platform && (
                  <span className={`px-3 py-1 rounded-full ${getPlatformColor(post.platform)}`}>
                    {post.platform}
                  </span>
                )}
                {post.status && (
                  <span className={`px-3 py-1 rounded-full ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                )}
                {post.imageSource && (
                  <span className={`px-3 py-1 rounded-full ${getSourceColor(post.imageSource)}`}>
                    {post.imageSource}
                  </span>
                )}
              </div>
              {post.publishDate && (
                <p className="mt-2 text-gray-300">
                  {formatDate(post.publishDate)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
