import { NotionPost } from '@/types';
import { Play, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface SimpleWidgetCardProps {
  post: NotionPost;
  aspectRatio?: string;
}

export default function SimpleWidgetCard({ post, aspectRatio = 'square' }: SimpleWidgetCardProps) {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'auto':
        return 'aspect-auto';
      default:
        return 'aspect-[3/4]';
    }
  };

  const hasVideo = post.videos && post.videos.length > 0;
  const hasImages = post.images && post.images.length > 0;
  const hasMultipleMedia = (post.images?.length || 0) + (post.videos?.length || 0) > 1;
  
  const mainImage = post.images?.[0];
  const mainVideo = post.videos?.[0];

  if (!mainImage && !mainVideo) {
    return null;
  }

  return (
    <div className="group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100">
        {/* Media (Image or Video) */}
        <div className={`relative ${getAspectRatioClass()} overflow-hidden`}>
          {hasVideo ? (
            // Video display
            <video
              className="w-full h-full object-cover"
              poster={mainImage?.url}
              controls
            >
              <source src={mainVideo.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Image display
            <Image
              src={mainImage?.url || ''}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                // Handle image error silently
              }}
            />
          )}

          {/* Top-right icon and media count */}
          <div className="absolute top-2 right-2 flex gap-2">
            {hasMultipleMedia && (
              <div className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                {(post.images?.length || 0) + (post.videos?.length || 0)}
              </div>
            )}
            <div className="w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm">
              {hasVideo ? (
                <Play className="w-3 h-3 text-gray-600" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Overlay with content on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4">
            {/* Title and date overlay */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <h3 className="font-medium text-sm line-clamp-2">
                    {post.title}
                  </h3>
                </div>
                {post.publishDate && (
                  <div className="text-sm">
                    {new Date(post.publishDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
