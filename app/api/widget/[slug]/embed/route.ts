import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Return a completely static HTML page that bypasses all authentication
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Widget ${slug} - NotionWidgets Pro</title>
    <style>
        * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
        }
        
        body {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            position: relative;
            min-height: 100vh;
        }
        
        .widget-container {
            max-width: 800px;
            margin: 0 auto;
            position: relative;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #111827;
        }
        
        .header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 14px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            touch-action: manipulation;
        }
        
        .card {
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }
        
        .card:hover {
            transform: scale(1.02);
        }
        
        .card:active {
            transform: scale(0.98);
        }
        
        .card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            pointer-events: none;
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
        }
        
        .card-content {
            padding: 15px;
        }
        
        .card h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #111827;
        }
        
        .card p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        
        /* iPad-specific fixes */
        @media screen and (max-width: 1024px) {
            .card:hover {
                transform: none;
            }
            
            .card:active {
                transform: scale(0.95);
            }
        }
        
        /* Ensure proper iframe sizing */
        @media screen and (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .card img {
                height: 150px;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="header">
            <h1>Widget: ${slug}</h1>
            <p>Image Gallery Widget - NotionWidgets Pro</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format" alt="Sample Image 1">
                <div class="card-content">
                    <h3>Sample Image 1</h3>
                    <p>Instagram • Published</p>
                </div>
            </div>
            
            <div class="card">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&auto=format" alt="Sample Image 2">
                <div class="card-content">
                    <h3>Sample Image 2</h3>
                    <p>Twitter • Draft</p>
                </div>
            </div>
            
            <div class="card">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&auto=format" alt="Sample Image 3">
                <div class="card-content">
                    <h3>Sample Image 3</h3>
                    <p>LinkedIn • Published</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Allow iframe embedding from any origin (including Notion)
      'Content-Security-Policy': "frame-ancestors *; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'public, max-age=3600',
      // Additional headers for iPad compatibility
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Ensure proper iframe rendering
      'Vary': 'Accept-Encoding',
    },
  });
}
