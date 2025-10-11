'use client';

import { NotionPost } from '@/types';

interface DebugInfoProps {
  posts: NotionPost[];
  isVisible?: boolean;
}

export default function DebugInfo({ posts, isVisible = false }: DebugInfoProps) {
  if (!isVisible) return null;

  const testImageLoad = async (url: string, source: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        status: 'ERROR',
        statusText: error instanceof Error ? error.message : 'Unknown error',
        headers: {}
      };
    }
  };

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <h3 className="font-bold mb-2">🔍 DEBUG: Media URLs Analysis for Notion Embed</h3>
      <div className="text-sm space-y-3">
        <div className="bg-red-100 p-2 rounded">
          <p className="font-bold text-red-800">⚠️ 403 ERROR ANALYSIS:</p>
          <p className="text-xs">The 403 errors you see in Notion are likely due to:</p>
          <ul className="text-xs ml-4 list-disc">
            <li>Notion's Content Security Policy (CSP) blocking external domains</li>
            <li>Iframe sandbox restrictions preventing certain network requests</li>
            <li>Canva embed URLs being blocked by Notion's security policies</li>
            <li>Cross-origin restrictions when loading from Notion's domain</li>
          </ul>
        </div>
        
        <p><strong>Total Posts:</strong> {posts.length}</p>
        {posts.map((post, index) => (
          <div key={post.id} className="ml-4 border-l-2 border-yellow-300 pl-2 bg-white p-2 rounded">
            <p><strong>Post {index + 1}:</strong> {post.title}</p>
            <p><strong>Platform:</strong> {post.platform || 'None'} | <strong>Status:</strong> {post.status || 'None'}</p>
            <p><strong>Images ({post.images.length}):</strong></p>
            {post.images.map((img, imgIndex) => (
              <div key={imgIndex} className="ml-4 text-xs bg-gray-50 p-2 rounded mt-1">
                <p><strong>Image {imgIndex + 1}:</strong></p>
                <p><strong>Source:</strong> {img.source}</p>
                <p><strong>URL:</strong> <code className="bg-gray-200 px-1 rounded">{img.url}</code></p>
                {img.originalUrl && (
                  <p><strong>Original URL:</strong> <code className="bg-gray-200 px-1 rounded">{img.originalUrl}</code></p>
                )}
                {img.isEmbed && (
                  <p className="text-orange-600 font-bold">⚠️ CANVA EMBED - Likely blocked by Notion CSP</p>
                )}
                <p><strong>Domain:</strong> {new URL(img.url).hostname}</p>
                <p><strong>Protocol:</strong> {new URL(img.url).protocol}</p>
              </div>
            ))}
            <p><strong>Videos ({post.videos.length}):</strong></p>
            {post.videos.map((vid, vidIndex) => (
              <div key={vidIndex} className="ml-4 text-xs bg-gray-50 p-2 rounded mt-1">
                <p><strong>Video {vidIndex + 1}:</strong></p>
                <p><strong>Source:</strong> {vid.source}</p>
                <p><strong>URL:</strong> <code className="bg-gray-200 px-1 rounded">{vid.url}</code></p>
                <p><strong>Type:</strong> {vid.type}</p>
                <p><strong>Domain:</strong> {new URL(vid.url).hostname}</p>
              </div>
            ))}
          </div>
        ))}
        
        <div className="bg-blue-100 p-2 rounded">
          <p className="font-bold text-blue-800">🔧 NEXT STEPS:</p>
          <ol className="text-xs ml-4 list-decimal">
            <li>Check browser console in Notion for CSP errors</li>
            <li>Test if Canva embeds work directly in Notion (without your widget)</li>
            <li>Consider using direct image URLs instead of Canva embeds</li>
            <li>Implement fallback images for blocked content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
