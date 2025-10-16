import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Special Notion-optimized HTML for iPad iframe embedding
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Widget ${slug} - NotionWidgets Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        html, body {
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            background: white;
        }
        
        .notion-widget {
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            min-height: 400px;
        }
        
        .widget-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-header h1 {
            margin: 0;
            font-size: 24px;
            color: #111827;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 14px;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .widget-card {
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease;
            cursor: pointer;
            touch-action: manipulation;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
            height: auto !important;
            min-height: 200px !important;
        }
        
        .widget-card:hover {
            transform: scale(1.02);
        }
        
        .widget-card:active {
            transform: scale(0.98);
        }
        
        .widget-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            pointer-events: none;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-card-content {
            padding: 15px;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-card h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #111827;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        .widget-card p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
        }
        
        /* iPad-specific fixes */
        @media screen and (max-width: 1024px) {
            .widget-card:hover {
                transform: none;
            }
            
            .widget-card:active {
                transform: scale(0.95);
            }
            
            .widget-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .widget-card img {
                height: 150px;
            }
        }
        
        /* Force visibility for all elements */
        * {
            visibility: visible !important;
        }
    </style>
</head>
<body>
    <div class="notion-widget">
        <div class="widget-header">
            <h1>Widget: ${slug}</h1>
            <p>Image Gallery Widget - NotionWidgets Pro</p>
        </div>
        
        <div class="widget-grid">
            <div class="widget-card">
                <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format" alt="Sample Image 1">
                <div class="widget-card-content">
                    <h3>Sample Image 1</h3>
                    <p>Instagram • Published</p>
                </div>
            </div>
            
            <div class="widget-card">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&auto=format" alt="Sample Image 2">
                <div class="widget-card-content">
                    <h3>Sample Image 2</h3>
                    <p>Twitter • Draft</p>
                </div>
            </div>
            
            <div class="widget-card">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&auto=format" alt="Sample Image 3">
                <div class="widget-card-content">
                    <h3>Sample Image 3</h3>
                    <p>LinkedIn • Published</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Aggressive Notion iPad iframe fix
        (function() {
            // Force immediate visibility
            document.documentElement.style.visibility = 'visible';
            document.documentElement.style.display = 'block';
            document.documentElement.style.opacity = '1';
            
            // Force body visibility immediately
            document.body.style.visibility = 'visible';
            document.body.style.display = 'block';
            document.body.style.opacity = '1';
            document.body.style.height = 'auto';
            document.body.style.minHeight = '100vh';
            
            // Force all elements to be visible
            function forceVisibility() {
                const allElements = document.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.visibility = 'visible';
                    el.style.display = el.style.display || 'block';
                    el.style.opacity = '1';
                    el.style.height = 'auto';
                    el.style.minHeight = 'auto';
                });
            }
            
            // Run immediately
            forceVisibility();
            
            // Run on load
            window.addEventListener('load', forceVisibility);
            
            // Run multiple times for Notion iPad
            setTimeout(forceVisibility, 50);
            setTimeout(forceVisibility, 100);
            setTimeout(forceVisibility, 200);
            setTimeout(forceVisibility, 500);
            setTimeout(forceVisibility, 1000);
            
            // Continuous monitoring
            setInterval(forceVisibility, 2000);
            
            // Prevent zoom on double tap for iPad
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function (event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        })();
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "frame-ancestors *; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Vary': 'Accept-Encoding',
    },
  });
}
