import { Client } from '@notionhq/client';
import { NotionPost, NotionImage, NotionVideo, DatabaseColumn } from '@/types';

// Convert Canva design URL to multiple image URLs
function convertCanvaUrlToImages(canvaUrl: string): NotionImage[] {
  // Canva design URLs look like: https://www.canva.com/design/DAGiPMnfawk/p4ZSR2b2w14NgJ9m4dSYrg/view
  // Extract the design ID from the URL
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  
  if (designIdMatch) {
    const designId = designIdMatch[1];
    
    // Extract multiple images from Canva design using embed format
    // Canva designs can be accessed as individual pages using embed URLs
    const numberOfImages = 3;
    const images: NotionImage[] = [];
    
    for (let i = 1; i <= numberOfImages; i++) {
      // Use our server-side proxy to fetch Canva images
      // This bypasses CORS restrictions and works reliably in Notion embeds
      const proxyUrl = `/api/canva-image?url=${encodeURIComponent(canvaUrl)}&page=${i}`;
      
      images.push({
        url: proxyUrl,
        source: 'canva',
        originalUrl: canvaUrl,
        pageNumber: i,
      });
    }
    
    return images;
  }
  
  // Fallback to single placeholder if URL doesn't match expected pattern
  const placeholders = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=500&fit=crop&auto=format', // Business/office
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop&auto=format', // Team meeting
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop&auto=format', // Business strategy
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=500&fit=crop&auto=format', // Creative workspace
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=500&fit=crop&auto=format'  // Professional woman
  ];
  
  // Use a simple hash to pick a consistent placeholder for the same URL
  let hash = 0;
  for (let i = 0; i < canvaUrl.length; i++) {
    const char = canvaUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % placeholders.length;
  
  return [{
    url: placeholders[index],
    source: 'canva',
    originalUrl: canvaUrl,
  }];
}

// Convert database ID from URL format to Notion API format
function formatDatabaseId(databaseId: string): string {
  // Remove any URL parts and clean the ID
  let cleanId = databaseId.replace(/^https?:\/\/[^\/]+\//, '').replace(/\?.*$/, '');
  
  // If it's already in the correct format (with dashes), return as is
  if (cleanId.includes('-')) {
    return cleanId;
  }
  
  // Convert from 32-character format to UUID format
  if (cleanId.length === 32) {
    return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20, 32)}`;
  }
  
  return cleanId;
}

export async function testNotionConnection(token: string, databaseId: string): Promise<boolean> {
  try {
    const notion = new Client({ auth: token });
    const formattedId = formatDatabaseId(databaseId);
    await notion.databases.retrieve({ database_id: formattedId });
    return true;
  } catch (error) {
    console.error('Notion connection test failed:', error);
    return false;
  }
}

export async function detectDatabaseColumns(token: string, databaseId: string): Promise<DatabaseColumn[]> {
  try {
    const notion = new Client({ auth: token });
    const formattedId = formatDatabaseId(databaseId);
    const database = await notion.databases.retrieve({ database_id: formattedId });
    
    const columns: DatabaseColumn[] = [];
    
    for (const [key, value] of Object.entries(database.properties)) {
      columns.push({
        name: value.name,
        type: value.type,
        id: key,
      });
    }
    
    return columns;
  } catch (error) {
    console.error('Error detecting database columns:', error);
    throw new Error('Failed to detect database columns');
  }
}

export async function fetchNotionDatabase(
  token: string, 
  databaseId: string, 
  platformFilter?: string,
  statusFilter?: string
): Promise<NotionPost[]> {
  try {
    console.log('Creating Notion client with token:', token.substring(0, 10) + '...');
    const notion = new Client({ auth: token });
    const formattedId = formatDatabaseId(databaseId);
    console.log('Formatted database ID:', formattedId);
    const posts: NotionPost[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: formattedId,
        start_cursor: startCursor,
        page_size: 100,
        sorts: [
          {
            property: 'Publish Date',
            direction: 'descending',
          },
        ],
      });

      for (const page of response.results) {
        if ('properties' in page) {
          const post = await extractPostFromPage(page);
          
          // Apply filters
          if (platformFilter && post.platform !== platformFilter) {
            continue;
          }
          if (statusFilter && post.status !== statusFilter) {
            continue;
          }
          
          posts.push(post);
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Notion database:', error);
    throw new Error('Failed to fetch Notion database');
  }
}

async function extractPostFromPage(page: any): Promise<NotionPost> {
  const properties = page.properties;
  
  // Extract title
  const title = properties.Name?.title?.[0]?.plain_text || 'Untitled';
  
  // Extract publish date
  let publishDate: string | null = null;
  if (properties['Publish Date']?.date?.start) {
    publishDate = properties['Publish Date'].date.start;
  }
  
  // Extract platform
  let platform: string | null = null;
  if (properties.Platform?.select?.name) {
    platform = properties.Platform.select.name;
  }
  
  // Extract status
  let status: string | null = null;
  if (properties.Status?.status?.name) {
    status = properties.Status.status.name;
  }
  
  // Extract image source
  let imageSource: string | null = null;
  if (properties['Image Source']?.select?.name) {
    imageSource = properties['Image Source'].select.name;
  }
  
  // Extract images and videos from all possible columns
  const images: NotionImage[] = [];
  const videos: NotionVideo[] = [];
  
  // Helper function to detect if URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    // Check file extension
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for video MIME type in URL parameters
    const hasVideoMimeType = videoMimeTypes.some(mime => url.includes(mime));
    
    return hasVideoExtension || hasVideoMimeType;
  };
  
  // Helper function to get video MIME type from URL
  const getVideoMimeType = (url: string): string => {
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.ogg')) return 'video/ogg';
    if (url.includes('.mov')) return 'video/quicktime';
    return 'video/mp4'; // default
  };
  
  // From Link column (rich_text) - this has the actual URLs
  if (properties.Link?.rich_text && properties.Link.rich_text.length > 0) {
    for (const text of properties.Link.rich_text) {
      if (text.href) {
        if (isVideoUrl(text.href)) {
          videos.push({
            url: text.href,
            source: 'link',
            originalUrl: text.href,
            type: getVideoMimeType(text.href),
          });
        } else {
          images.push({
            url: text.href,
            source: 'link',
            originalUrl: text.href,
          });
        }
      }
    }
  }
  
  // From Attachment column
  if (properties.Attachment?.files) {
    for (const file of properties.Attachment.files) {
      const fileUrl = file.type === 'external' ? file.external?.url : file.file?.url;
      if (fileUrl) {
        if (isVideoUrl(fileUrl)) {
          videos.push({
            url: fileUrl,
            source: 'attachment',
            originalUrl: fileUrl,
            type: getVideoMimeType(fileUrl),
          });
        } else {
          images.push({
            url: fileUrl,
            source: 'attachment',
            originalUrl: fileUrl,
          });
        }
      }
    }
  }
  
  // From Canva Link column - handle both single URL and multiple URLs
  if (properties['Canva Link']?.url) {
    const canvaUrl = properties['Canva Link'].url;
    // Convert Canva design URL to multiple image URLs
    const canvaImages = convertCanvaUrlToImages(canvaUrl);
    images.push(...canvaImages);
  }
  
  // Also check if Canva Link is rich_text (multiple URLs)
  if (properties['Canva Link']?.rich_text && properties['Canva Link'].rich_text.length > 0) {
    for (const text of properties['Canva Link'].rich_text) {
      if (text.href) {
        const canvaImages = convertCanvaUrlToImages(text.href);
        images.push(...canvaImages);
      }
    }
  }
  
  return {
    id: page.id,
    title,
    publishDate,
    platform,
    status,
    imageSource,
    images,
    videos,
  };
}

export function extractImages(page: any): NotionImage[] {
  const images: NotionImage[] = [];
  const properties = page.properties;
  
  // Helper function to detect if URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    // Check file extension
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for video MIME type in URL parameters
    const hasVideoMimeType = videoMimeTypes.some(mime => url.includes(mime));
    
    return hasVideoExtension || hasVideoMimeType;
  };
  
  // From Link column (rich_text) - this has the actual image URLs
  if (properties.Link?.rich_text && properties.Link.rich_text.length > 0) {
    for (const text of properties.Link.rich_text) {
      if (text.href && !isVideoUrl(text.href)) {
        images.push({
          url: text.href,
          source: 'link',
          originalUrl: text.href,
        });
      }
    }
  }
  
  // From Attachment column
  if (properties.Attachment?.files) {
    for (const file of properties.Attachment.files) {
      const fileUrl = file.type === 'external' ? file.external?.url : file.file?.url;
      if (fileUrl && !isVideoUrl(fileUrl)) {
        images.push({
          url: fileUrl,
          source: 'attachment',
          originalUrl: fileUrl,
        });
      }
    }
  }
  
  // From Canva Link column - handle both single URL and multiple URLs
  if (properties['Canva Link']?.url) {
    const canvaUrl = properties['Canva Link'].url;
    // Convert Canva design URL to multiple image URLs
    const canvaImages = convertCanvaUrlToImages(canvaUrl);
    images.push(...canvaImages);
  }
  
  // Also check if Canva Link is rich_text (multiple URLs)
  if (properties['Canva Link']?.rich_text && properties['Canva Link'].rich_text.length > 0) {
    for (const text of properties['Canva Link'].rich_text) {
      if (text.href) {
        const canvaImages = convertCanvaUrlToImages(text.href);
        images.push(...canvaImages);
      }
    }
  }
  
  return images;
}

export function extractVideos(page: any): NotionVideo[] {
  const videos: NotionVideo[] = [];
  const properties = page.properties;
  
  // Helper function to detect if URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    // Check file extension
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for video MIME type in URL parameters
    const hasVideoMimeType = videoMimeTypes.some(mime => url.includes(mime));
    
    return hasVideoExtension || hasVideoMimeType;
  };
  
  // Helper function to get video MIME type from URL
  const getVideoMimeType = (url: string): string => {
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.ogg')) return 'video/ogg';
    if (url.includes('.mov')) return 'video/quicktime';
    return 'video/mp4'; // default
  };
  
  // From Link column (rich_text) - this has the actual video URLs
  if (properties.Link?.rich_text && properties.Link.rich_text.length > 0) {
    for (const text of properties.Link.rich_text) {
      if (text.href && isVideoUrl(text.href)) {
        videos.push({
          url: text.href,
          source: 'link',
          originalUrl: text.href,
          type: getVideoMimeType(text.href),
        });
      }
    }
  }
  
  // From Attachment column
  if (properties.Attachment?.files) {
    for (const file of properties.Attachment.files) {
      const fileUrl = file.type === 'external' ? file.external?.url : file.file?.url;
      if (fileUrl && isVideoUrl(fileUrl)) {
        videos.push({
          url: fileUrl,
          source: 'attachment',
          originalUrl: fileUrl,
          type: getVideoMimeType(fileUrl),
        });
      }
    }
  }
  
  return videos;
}

