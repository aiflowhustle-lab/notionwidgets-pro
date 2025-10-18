import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Return a mobile-compatible iframe embed
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget ${slug}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            overflow-x: hidden;
        }
        .widget-iframe {
            width: 100%;
            height: 100vh;
            border: none;
            display: block;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: white;
            color: #6b7280;
            font-size: 14px;
        }
        .error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: white;
            color: #ef4444;
            font-size: 14px;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div id="widget-container">
        <div class="loading" id="loading">
            Loading widget...
        </div>
    </div>

    <script>
        // Mobile-compatible iframe loading
        function loadWidget() {
            const container = document.getElementById('widget-container');
            const loading = document.getElementById('loading');
            
            try {
                // Create iframe with mobile-compatible attributes
                const iframe = document.createElement('iframe');
                iframe.className = 'widget-iframe';
                iframe.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://notionwidgets-pro.vercel.app'}/w/${slug}';
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
                iframe.setAttribute('loading', 'lazy');
                iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                
                // Handle load events
                iframe.onload = function() {
                    loading.style.display = 'none';
                };
                
                iframe.onerror = function() {
                    loading.innerHTML = '<div class="error">Failed to load widget. Please try again.</div>';
                };
                
                // Add iframe to container
                container.appendChild(iframe);
                
            } catch (error) {
                console.error('Error loading widget:', error);
                loading.innerHTML = '<div class="error">Error loading widget. Please refresh the page.</div>';
            }
        }
        
        // Load widget when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadWidget);
        } else {
            loadWidget();
        }
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors *; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src *;",
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
