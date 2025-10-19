import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { decryptToken } from '@/lib/encryption';
import { fetchNotionDatabase } from '@/lib/notion';
import { NotionPost } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  try {
    // Fetch widget from Firestore
    const widget = await getWidget(slug);
    
    if (!widget) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Widget Not Found</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f9fafb;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .error-container {
              text-align: center;
              max-width: 400px;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .error-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 16px;
              background: #fef2f2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #dc2626;
              font-size: 24px;
            }
            .error-title {
              font-size: 24px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 8px;
            }
            .error-message {
              color: #6b7280;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h1 class="error-title">Widget Not Found</h1>
            <p class="error-message">The widget "${slug}" could not be found.</p>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Frame-Options': 'ALLOWALL',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Decrypt Notion token
    let decryptedToken: string;
    try {
      decryptedToken = decryptToken(widget.token);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Widget Error</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f9fafb;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .error-container {
              text-align: center;
              max-width: 400px;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .error-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 16px;
              background: #fef2f2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #dc2626;
              font-size: 24px;
            }
            .error-title {
              font-size: 24px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 8px;
            }
            .error-message {
              color: #6b7280;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">🔐</div>
            <h1 class="error-title">Authentication Error</h1>
            <p class="error-message">Unable to decrypt widget credentials.</p>
          </div>
        </body>
        </html>
      `, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Frame-Options': 'ALLOWALL',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Fetch data from Notion API
    let posts: NotionPost[];
    try {
      posts = await fetchNotionDatabase(decryptedToken, widget.databaseId);
    } catch (error) {
      console.error('Error fetching Notion data:', error);
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Widget Error</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f9fafb;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .error-container {
              text-align: center;
              max-width: 400px;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .error-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 16px;
              background: #fef2f2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #dc2626;
              font-size: 24px;
            }
            .error-title {
              font-size: 24px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 8px;
            }
            .error-message {
              color: #6b7280;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">📡</div>
            <h1 class="error-title">Data Error</h1>
            <p class="error-message">Unable to fetch data from Notion.</p>
          </div>
        </body>
        </html>
      `, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Frame-Options': 'ALLOWALL',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Process all images and create HTML
    const allImages = posts.flatMap(post => post.images);
    
    // Generate HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${widget.name} - NotionWidgets Pro</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f9fafb;
      padding: 16px;
    }
    .container { 
      max-width: 1400px; 
      margin: 0 auto; 
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 16px; 
    }
    .card { 
      position: relative; 
      aspect-ratio: 1; 
      overflow: hidden; 
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      background: white;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .card img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      display: block;
    }
    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      color: white;
      padding: 16px;
      transform: translateY(100%);
      transition: transform 0.2s ease;
    }
    .card:hover .card-content {
      transform: translateY(0);
    }
    .card-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .card-meta {
      font-size: 12px;
      opacity: 0.9;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #111827;
    }
    .empty-message {
      font-size: 14px;
    }
    @media (max-width: 768px) {
      .grid { 
        grid-template-columns: repeat(2, 1fr); 
        gap: 12px; 
      }
      .container {
        padding: 0 8px;
      }
    }
    @media (max-width: 480px) {
      .grid { 
        grid-template-columns: 1fr; 
        gap: 8px; 
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${widget.name}</h1>
      <p>NotionWidgets Pro - iPad Compatible</p>
    </div>
    
    ${allImages.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📷</div>
        <h2 class="empty-title">No Images Found</h2>
        <p class="empty-message">This widget doesn't have any images yet.</p>
      </div>
    ` : `
      <div class="grid">
        ${allImages.map(img => `
          <div class="card">
            <img src="${img.url}" alt="${img.originalUrl || 'Image'}" loading="lazy">
            <div class="card-content">
              <div class="card-title">${img.source === 'canva' ? 'Canva Design' : 'Image'}</div>
              <div class="card-meta">${img.source.toUpperCase()}</div>
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
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Unexpected error in static widget route:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Widget Error</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f9fafb;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .error-container {
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .error-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: #fef2f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dc2626;
            font-size: 24px;
          }
          .error-title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          .error-message {
            color: #6b7280;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h1 class="error-title">Something went wrong</h1>
          <p class="error-message">An unexpected error occurred while loading the widget.</p>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
