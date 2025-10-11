import { NextRequest, NextResponse } from 'next/server';

interface CanvaProcessRequest {
  designId: string;
  pageNumber: number;
  originalUrl: string;
}

interface CanvaProcessResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  cached?: boolean;
}

// Cache for processed images (in production, use Redis)
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { designId, pageNumber, originalUrl }: CanvaProcessRequest = await request.json();

    if (!designId || !pageNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: designId, pageNumber' 
      }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `${designId}-${pageNumber}`;
    const cached = imageCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        imageUrl: cached.url,
        cached: true
      });
    }

    // Process Canva design on server-side
    const processedImageUrl = await processCanvaDesign(designId, pageNumber, originalUrl);
    
    if (processedImageUrl) {
      // Cache the result
      imageCache.set(cacheKey, {
        url: processedImageUrl,
        timestamp: Date.now()
      });

      return NextResponse.json({
        success: true,
        imageUrl: processedImageUrl,
        cached: false
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to process Canva design'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing Canva design:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function processCanvaDesign(designId: string, pageNumber: number, originalUrl: string): Promise<string | null> {
  try {
    // Method 1: Try direct image export URL
    const directImageUrl = `https://www.canva.com/design/${designId}/view?page=${pageNumber}&format=png&width=800`;
    
    // Test if the direct URL works
    const response = await fetch(directImageUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NotionWidgets/1.0)',
        'Accept': 'image/png,image/jpeg,image/*,*/*',
      }
    });

    if (response.ok) {
      console.log(`Direct image URL works for ${designId} page ${pageNumber}`);
      return directImageUrl;
    }

    // Method 2: Try alternative export formats
    const alternativeFormats = [
      `https://www.canva.com/design/${designId}/view?page=${pageNumber}&format=jpg&width=800`,
      `https://www.canva.com/design/${designId}/view?page=${pageNumber}&format=png&width=1200`,
      `https://www.canva.com/design/${designId}/view?page=${pageNumber}&format=png&width=600`,
    ];

    for (const url of alternativeFormats) {
      try {
        const testResponse = await fetch(url, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log(`Alternative format works for ${designId} page ${pageNumber}: ${url}`);
          return url;
        }
      } catch (e) {
        // Continue to next format
      }
    }

    // Method 3: Fallback to placeholder with design info
    console.log(`No working format found for ${designId} page ${pageNumber}, using fallback`);
    return createFallbackImage(designId, pageNumber);

  } catch (error) {
    console.error(`Error processing Canva design ${designId} page ${pageNumber}:`, error);
    return createFallbackImage(designId, pageNumber);
  }
}

function createFallbackImage(designId: string, pageNumber: number): string {
  // Create a data URL with a placeholder image
  const canvas = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#f3f4f6"/>
      <rect x="50" y="50" width="700" height="500" fill="#ffffff" stroke="#e5e7eb" stroke-width="2"/>
      <text x="400" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151">Canva Design</text>
      <text x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">Page ${pageNumber}</text>
      <text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">ID: ${designId.substring(0, 8)}...</text>
      <rect x="350" y="350" width="100" height="40" fill="#f59e0b" rx="4"/>
      <text x="400" y="375" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white">Click to View</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}
