import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { NotionPost } from '@/types';

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
    let posts: NotionPost[] = [];
    try {
      const decryptedToken = decryptToken(widget.token);
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
    } catch (error) {
      console.error('Error fetching Notion data for embed:', error);
      // Fallback to empty array if Notion fails
    }

    // Generate ultra-simple HTML like your competitor
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${widget.name}</title>
<style>
body{margin:0;padding:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff}
.container{max-width:100%;margin:0 auto}
.header{text-align:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #eee}
.header h1{margin:0;font-size:16px;color:#333;font-weight:600}
.header p{margin:3px 0 0 0;color:#666;font-size:11px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.card{background:#f8f9fa;border-radius:6px;overflow:hidden;border:1px solid #e9ecef}
.card img{width:100%;height:100px;object-fit:cover;display:block}
.card-content{padding:8px}
.card h3{margin:0 0 4px 0;font-size:12px;color:#333;font-weight:500;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card p{margin:0;font-size:9px;color:#666}
.badge{display:inline-block;padding:1px 4px;border-radius:3px;font-size:8px;font-weight:500;margin-right:3px}
.platform{background:#e3f2fd;color:#1976d2}
.status{background:#f3e5f5;color:#7b1fa2}
.empty{text-align:center;padding:30px 15px;color:#666}
.empty h3{margin:0 0 5px 0;font-size:14px;color:#333}
.empty p{margin:0;font-size:12px}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>${widget.name}</h1>
<p>Content Gallery</p>
</div>
${posts.length === 0 ? `
<div class="empty">
<h3>No content yet</h3>
<p>This widget is empty.</p>
</div>
` : `
<div class="grid">
${posts.map(post => `
<div class="card">
${post.images.length > 0 ? `<img src="${post.images[0].url}" alt="${post.title}">` : `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE0MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik01NiA0MEg4NFY2MEg1NlY0MFoiIGZpbGw9IiNFOUVDRUYiLz4KPHBhdGggZD0iTTYzIDQ3SDc3VjUzSDYzVjQ3WiIgZmlsbD0iIzlCQkE1Ii8+Cjwvc3ZnPgo=" alt="No image">`}
<div class="card-content">
<h3>${post.title}</h3>
<p>${post.platform ? `<span class="badge platform">${post.platform}</span>` : ''}${post.status ? `<span class="badge status">${post.status}</span>` : ''}</p>
</div>
</div>
`).join('')}
</div>
`}
</div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
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
