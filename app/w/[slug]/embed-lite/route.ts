import { NextRequest, NextResponse } from 'next/server';
import { getWidget } from '@/lib/firestore-admin';
import { fetchNotionDatabase } from '@/lib/notion';
import { decryptToken } from '@/lib/encryption';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Fallback data function
function getFallbackData() {
  return [
    {
      id: '1',
      title: 'Sample Instagram Post',
      publishDate: '2024-01-15',
      platform: 'Instagram',
      status: 'Done',
      imageSource: 'attachment',
      pinned: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop',
          source: 'attachment' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    },
    {
      id: '2',
      title: 'TikTok Video Thumbnail',
      publishDate: '2024-01-14',
      platform: 'TikTok',
      status: 'In progress',
      imageSource: 'link',
      pinned: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&h=500&fit=crop',
          source: 'link' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    },
    {
      id: '3',
      title: 'Canva Design',
      publishDate: '2024-01-13',
      platform: 'Others',
      status: 'Done',
      imageSource: 'canva',
      pinned: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
          source: 'canva' as const,
          originalUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop'
        }
      ],
      videos: []
    }
  ];
}

// HTML escape function
function esc(s: string): string {
  return s.replace(/[&<>"']/g, m => ({ 
    "&": "&amp;", 
    "<": "&lt;", 
    ">": "&gt;", 
    "\"": "&quot;", 
    "'": "&#39;" 
  }[m]!));
}

// Render lite widget HTML with minimal JS
function renderLiteWidget(widget: any, posts: any[], viewMode: string = 'all') {
  const filteredPosts = viewMode === 'videos' 
    ? posts.filter(post => post.videos && post.videos.length > 0)
    : posts;

  if (filteredPosts.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </div>
        <h3 class="empty-title">${viewMode === 'videos' ? 'No videos found' : 'No images found'}</h3>
        <p class="empty-text">${viewMode === 'videos' 
          ? 'This widget doesn\'t have any videos yet.' 
          : 'This widget doesn\'t have any images yet.'}</p>
      </div>
    `;
  }

  return `
    <div class="grid">
      ${filteredPosts.map(post => {
        const image = post.images && post.images[0];
        const aspectRatio = widget.settings?.aspectRatio || 'square';
        
        return `
          <div class="post-card" data-post-id="${post.id}">
            ${image ? `
              <img src="${esc(image.url)}" 
                   alt="${esc(post.title || 'Post')}" 
                   class="post-image" 
                   loading="lazy" />
            ` : `
              <div class="post-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            `}
            ${post.pinned ? `
              <div class="post-badge">PINNED</div>
            ` : ''}
            ${post.videos && post.videos.length > 0 ? `
              <div class="video-badge">VIDEO</div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const platformFilter = searchParams.get('platform') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const viewMode = searchParams.get('view') || 'all';
    const forceRefresh = searchParams.get('force_refresh') === 'true';

    // Get widget
    const widget = await getWidget(slug);
    if (!widget || !widget.isActive) {
      const errorHtml = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
          <style>
            html,body{margin:0;padding:0;background:#fff;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
            .error{text-align:center;padding:48px 12px;color:#ef4444}
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Widget Not Found</h1>
            <p>This widget could not be found or is not active.</p>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(errorHtml, { 
        status: 404,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': 'frame-ancestors https://www.notion.so https://notion.so https://*.notion.so https://*.notion.site'
        }
      });
    }

    // Check cache first (unless force refresh)
    let posts = null;
    if (!forceRefresh) {
      posts = await cacheService.get(widget.id, platformFilter, statusFilter);
    } else {
      await cacheService.invalidate(widget.id);
    }
    
    if (!posts) {
      // Cache miss - fetch from Notion with rate limiting
      await rateLimiter.waitForNextAvailable();
      
      const canMakeRequest = await rateLimiter.canMakeRequest();
      if (!canMakeRequest) {
        posts = getFallbackData();
        await cacheService.set(widget.id, posts, platformFilter, statusFilter);
      } else {
        try {
          const decryptedToken = decryptToken(widget.token);
          await rateLimiter.recordRequest();
          posts = await fetchNotionDatabase(decryptedToken, widget.databaseId, platformFilter, statusFilter);
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        } catch (error) {
          console.error('Error fetching from Notion:', error);
          posts = getFallbackData();
          await cacheService.set(widget.id, posts, platformFilter, statusFilter);
        }
      }
    }

    // Generate lite HTML with minimal JS
    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
  <title>${esc(widget.name)} - NotionWidgets Pro</title>
  <style>
    html,body{margin:0;padding:0;background:#fff;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.4}
    .widget-container{padding:12px;max-width:100%}
    .widget-header{text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb}
    .widget-title{font-size:18px;font-weight:600;color:#111827;margin:0 0 4px}
    .widget-subtitle{font-size:14px;color:#6b7280;margin:0}
    .view-toggle{display:flex;justify-content:center;gap:8px;margin-bottom:16px}
    .view-btn{padding:6px 12px;border:1px solid #d1d5db;background:#fff;color:#374151;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s}
    .view-btn:hover{background:#f9fafb;border-color:#9ca3af}
    .view-btn.active{background:#000;color:#fff;border-color:#000}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;max-width:600px;margin:0 auto}
    .post-card{position:relative;aspect-ratio:1/1;background:#f3f4f6;border-radius:8px;overflow:hidden;cursor:pointer;transition:transform 0.2s}
    .post-card:hover{transform:scale(1.02)}
    .post-image{width:100%;height:100%;object-fit:cover;display:block}
    .post-placeholder{width:100%;height:100%;background:#e5e7eb;display:flex;align-items:center;justify-content:center}
    .post-badge{position:absolute;top:4px;right:4px;background:#000;color:#fff;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:500}
    .video-badge{position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.7);color:#fff;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:500}
    .empty-state{text-align:center;padding:48px 12px}
    .empty-icon{width:96px;height:96px;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
    .empty-title{font-size:18px;font-weight:500;color:#111827;margin:0 0 8px}
    .empty-text{color:#6b7280;margin:0}
    .loading{text-align:center;padding:24px;color:#6b7280}
    .refresh-btn{position:absolute;top:12px;right:12px;padding:4px 8px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:4px;font-size:10px;cursor:pointer;color:#374151}
    .refresh-btn:hover{background:#e5e7eb}
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="widget-header">
      <h1 class="widget-title">${esc(widget.name)}</h1>
      <p class="widget-subtitle">NotionWidgets Pro</p>
    </div>
    
    <div class="view-toggle">
      <button class="view-btn ${viewMode === 'all' ? 'active' : ''}" onclick="switchView('all')">All</button>
      <button class="view-btn ${viewMode === 'videos' ? 'active' : ''}" onclick="switchView('videos')">Videos</button>
    </div>
    
    <button class="refresh-btn" onclick="refreshWidget()">Refresh</button>
    
    <div id="content">
      ${renderLiteWidget(widget, posts, viewMode)}
    </div>
  </div>

  <script>
    // Minimal JavaScript for enhanced functionality
    let currentView = '${viewMode}';
    let currentFilters = {
      platform: '${platformFilter || ''}',
      status: '${statusFilter || ''}'
    };

    function switchView(view) {
      if (view === currentView) return;
      
      currentView = view;
      updateViewButtons();
      loadContent();
    }

    function updateViewButtons() {
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === currentView) {
          btn.classList.add('active');
        }
      });
    }

    function refreshWidget() {
      loadContent(true);
    }

    function loadContent(forceRefresh = false) {
      const content = document.getElementById('content');
      content.innerHTML = '<div class="loading">Loading...</div>';
      
      const params = new URLSearchParams();
      if (currentFilters.platform) params.set('platform', currentFilters.platform);
      if (currentFilters.status) params.set('status', currentFilters.status);
      if (currentView !== 'all') params.set('view', currentView);
      if (forceRefresh) params.set('force_refresh', 'true');
      
      const url = window.location.pathname + '?' + params.toString();
      
      fetch(url)
        .then(response => response.text())
        .then(html => {
          // Extract just the content part
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newContent = doc.querySelector('#content');
          if (newContent) {
            content.innerHTML = newContent.innerHTML;
          } else {
            content.innerHTML = '<div class="loading">Error loading content</div>';
          }
        })
        .catch(error => {
          console.error('Error loading content:', error);
          content.innerHTML = '<div class="loading">Error loading content</div>';
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      updateViewButtons();
    });
  </script>
</body>
</html>`;

    const response = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': 'frame-ancestors https://www.notion.so https://notion.so https://*.notion.so https://*.notion.site',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });

    return response;
  } catch (error) {
    console.error('Error generating lite embed:', error);
    const errorHtml = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
  <style>
    html,body{margin:0;padding:0;background:#fff;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
    .error{text-align:center;padding:48px 12px;color:#ef4444}
  </style>
</head>
<body>
  <div class="error">
    <h1>Error Loading Widget</h1>
    <p>There was an error loading this widget. Please try again later.</p>
  </div>
</body>
</html>
    `;
    return new NextResponse(errorHtml, { 
      status: 500,
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': 'frame-ancestors https://www.notion.so https://notion.so https://*.notion.so https://*.notion.site'
      }
    });
  }
}
