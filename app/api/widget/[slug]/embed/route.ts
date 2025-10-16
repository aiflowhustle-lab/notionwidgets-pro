import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  try {
    // Get widget data
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      return new NextResponse('Widget not found', { status: 404 });
    }

    // Fetch real data from Notion
    let posts = [];
    try {
      const decryptedToken = decryptToken(widget.token);
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
    } catch (error) {
      console.error('Error fetching Notion data for embed:', error);
      // Fallback to empty array if Notion fails
    }

    // Generate HTML with real data
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${widget.name} - NotionWidgets Pro</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            line-height: 1.4;
        }
        .widget-container {
            max-width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #111827;
            font-weight: 600;
        }
        .header p {
            margin: 4px 0 0 0;
            color: #6b7280;
            font-size: 12px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
        }
        .card {
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease;
            border: 1px solid #e5e7eb;
        }
        .card:hover {
            transform: scale(1.02);
        }
        .card img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            display: block;
        }
        .card-content {
            padding: 12px;
        }
        .card h3 {
            margin: 0 0 6px 0;
            font-size: 14px;
            color: #111827;
            font-weight: 500;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card p {
            margin: 0;
            font-size: 11px;
            color: #6b7280;
            line-height: 1.2;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }
        .empty-state h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #111827;
        }
        .empty-state p {
            margin: 0;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            margin-right: 4px;
        }
        .status-done {
            background: #dcfce7;
            color: #166534;
        }
        .status-not-started {
            background: #f3f4f6;
            color: #374151;
        }
        .platform-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: #e0e7ff;
            color: #3730a3;
        }
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
            }
            .card img {
                height: 100px;
            }
            .card-content {
                padding: 8px;
            }
            .card h3 {
                font-size: 12px;
            }
            .card p {
                font-size: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="header">
            <h1>${widget.name}</h1>
            <p>Image Gallery Widget - NotionWidgets Pro</p>
        </div>
        
        ${posts.length === 0 ? `
        <div class="empty-state">
            <h3>No images found</h3>
            <p>This widget doesn't have any images yet.</p>
        </div>
        ` : `
        <div class="grid">
            ${posts.map(post => `
            <div class="card">
                ${post.images.length > 0 ? `
                <img src="${post.images[0].url}" alt="${post.title}" loading="lazy">
                ` : `
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA0MEgxMjBWODBIODBWNDBaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik05MCA1MEgxMTBWNzBIOTBWNTBaIiBmaWxsPSIjOUI5QkE1Ii8+Cjwvc3ZnPgo=" alt="No image" loading="lazy">
                `}
                <div class="card-content">
                    <h3>${post.title}</h3>
                    <p>
                        ${post.platform ? `<span class="platform-badge">${post.platform}</span>` : ''}
                        ${post.status ? `<span class="status-badge status-${post.status.toLowerCase().replace(/\s+/g, '-')}">${post.status}</span>` : ''}
                    </p>
                </div>
            </div>
            `).join('')}
        </div>
        `}
    </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *; img-src * data:;",
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating embed:', error);
    
    // Fallback HTML for errors
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Error - NotionWidgets Pro</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            text-align: center;
        }
        .error-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .error-title {
            font-size: 18px;
            color: #111827;
            margin-bottom: 8px;
        }
        .error-message {
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Widget Unavailable</div>
        <div class="error-message">This widget is temporarily unavailable. Please try again later.</div>
    </div>
</body>
</html>
    `;

    return new NextResponse(fallbackHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *;",
        'Cache-Control': 'no-cache',
      },
    });
  }
}
