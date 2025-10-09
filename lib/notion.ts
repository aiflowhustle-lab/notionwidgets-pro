import { Client } from '@notionhq/client';
import { NotionPost, NotionImage, DatabaseColumn } from '@/types';

export async function testNotionConnection(token: string, databaseId: string): Promise<boolean> {
  try {
    const notion = new Client({ auth: token });
    await notion.databases.retrieve({ database_id: databaseId });
    return true;
  } catch (error) {
    console.error('Notion connection test failed:', error);
    return false;
  }
}

export async function detectDatabaseColumns(token: string, databaseId: string): Promise<DatabaseColumn[]> {
  try {
    const notion = new Client({ auth: token });
    const database = await notion.databases.retrieve({ database_id: databaseId });
    
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
    const notion = new Client({ auth: token });
    const posts: NotionPost[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
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
  
  // Extract images from all possible columns
  const images: NotionImage[] = [];
  
  // From Attachment column
  if (properties.Attachment?.files) {
    for (const file of properties.Attachment.files) {
      if (file.type === 'external' && file.external?.url) {
        images.push({
          url: file.external.url,
          source: 'attachment',
          originalUrl: file.external.url,
        });
      }
    }
  }
  
  // From Link column
  if (properties.Link?.url) {
    images.push({
      url: properties.Link.url,
      source: 'link',
      originalUrl: properties.Link.url,
    });
  }
  
  // From Canva Link column
  if (properties['Canva Link']?.url) {
    images.push({
      url: properties['Canva Link'].url,
      source: 'canva',
      originalUrl: properties['Canva Link'].url,
    });
  }
  
  return {
    id: page.id,
    title,
    publishDate,
    platform,
    status,
    imageSource,
    images,
  };
}

export function extractImages(page: any): NotionImage[] {
  const images: NotionImage[] = [];
  const properties = page.properties;
  
  // From Attachment column
  if (properties.Attachment?.files) {
    for (const file of properties.Attachment.files) {
      if (file.type === 'external' && file.external?.url) {
        images.push({
          url: file.external.url,
          source: 'attachment',
          originalUrl: file.external.url,
        });
      }
    }
  }
  
  // From Link column
  if (properties.Link?.url) {
    images.push({
      url: properties.Link.url,
      source: 'link',
      originalUrl: properties.Link.url,
    });
  }
  
  // From Canva Link column
  if (properties['Canva Link']?.url) {
    images.push({
      url: properties['Canva Link'].url,
      source: 'canva',
      originalUrl: properties['Canva Link'].url,
    });
  }
  
  return images;
}
