'use client';

import { NotionPost } from '@/types';

interface DebugInfoProps {
  posts: NotionPost[];
  isVisible?: boolean;
}

export default function DebugInfo({ posts, isVisible = false }: DebugInfoProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <div className="text-sm space-y-2">
        <p><strong>Total Posts:</strong> {posts.length}</p>
        {posts.map((post, index) => (
          <div key={post.id} className="ml-4 border-l-2 border-yellow-300 pl-2">
            <p><strong>Post {index + 1}:</strong> {post.title}</p>
            <p><strong>Platform:</strong> {post.platform || 'None'}</p>
            <p><strong>Status:</strong> {post.status || 'None'}</p>
            <p><strong>Images:</strong> {post.images.length}</p>
            {post.images.map((img, imgIndex) => (
              <div key={imgIndex} className="ml-4 text-xs">
                <p>• {img.source}: {img.url.substring(0, 60)}...</p>
                {img.source === 'canva' && <p className="text-orange-600">  (Canva Design)</p>}
              </div>
            ))}
            <p><strong>Videos:</strong> {post.videos.length}</p>
            {post.videos.map((vid, vidIndex) => (
              <div key={vidIndex} className="ml-4 text-xs">
                <p>• {vid.source}: {vid.url.substring(0, 60)}...</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
