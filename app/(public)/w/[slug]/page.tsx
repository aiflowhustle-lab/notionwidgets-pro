import { notFound } from 'next/navigation';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { NotionPost, WidgetFilters } from '@/types';
import WidgetCard from '@/components/WidgetCard';
import FilterBar from '@/components/FilterBar';
import { Image, AlertCircle } from 'lucide-react';

interface WidgetData {
  widget: {
    id: string;
    name: string;
    slug: string;
    settings: any;
    views: number;
  };
  posts: NotionPost[];
  availablePlatforms: string[];
  availableStatuses: string[];
}

interface PageProps {
  params: { slug: string };
  searchParams: { platform?: string; status?: string };
}

async function getWidgetData(slug: string, filters: WidgetFilters): Promise<WidgetData> {
  // Get widget from Firestore server-side
  const widget = await getWidget(slug);
  if (!widget || !widget.isActive) {
    notFound();
  }

  // Fetch real data from Notion server-side
  let posts: NotionPost[] = [];
  try {
    const decryptedToken = decryptToken(widget.token);
    posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, filters.platform, filters.status);
  } catch (error) {
    console.error('Error fetching Notion data:', error);
    // Fallback to empty array if Notion fails
  }

  // Get available filter options from all posts (not filtered)
  let allPosts: NotionPost[] = [];
  try {
    const decryptedToken = decryptToken(widget.token);
    allPosts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
  } catch (error) {
    console.error('Error fetching all posts for filters:', error);
  }

  const availablePlatforms = Array.from(new Set(allPosts.map(post => post.platform).filter(Boolean))) as string[];
  const availableStatuses = Array.from(new Set(allPosts.map(post => post.status).filter(Boolean))) as string[];

  return {
    widget: {
      id: widget.id,
      name: widget.name,
      slug: widget.slug,
      settings: widget.settings || {},
      views: widget.views || 0,
    },
    posts,
    availablePlatforms,
    availableStatuses,
  };
}

export default async function PublicWidgetPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const filters: WidgetFilters = {
    platform: searchParams.platform,
    status: searchParams.status,
  };

  let data: WidgetData;
  try {
    data = await getWidgetData(slug, filters);
  } catch (error) {
    console.error('Error loading widget data:', error);
    notFound();
  }

  const { widget, posts, availablePlatforms, availableStatuses } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{widget.name}</h1>
                <p className="text-sm text-gray-500">Image Gallery Widget</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">Powered by</div>
              <div className="text-sm font-medium text-gray-900">NotionWidgets Pro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Results - Aligned with grid */}
        <div className="max-w-4xl mx-auto">
          {/* Filters - Server-side rendered with URL params */}
          <div className="mb-6">
            <FilterBar
              onFiltersChange={() => {}} // No-op for server component
              availablePlatforms={availablePlatforms}
              availableStatuses={availableStatuses}
              onRefresh={() => {}} // No-op for server component
              currentFilters={filters}
            />
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {posts.length} {posts.length === 1 ? 'image' : 'images'}
              {Object.values(filters).some(v => v !== undefined) && ' (filtered)'}
            </p>
          </div>
        </div>

        {/* Images Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(v => v !== undefined)
                ? 'Try adjusting your filters to see more images.'
                : 'This widget doesn\'t have any images yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 max-w-4xl mx-auto">
            {posts.map((post, index) => (
              <WidgetCard
                key={post.id}
                post={post}
                aspectRatio={widget.settings?.aspectRatio || 'square'}
                priority={index < 6} // First 6 images (2 rows) get priority loading for iPad
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}