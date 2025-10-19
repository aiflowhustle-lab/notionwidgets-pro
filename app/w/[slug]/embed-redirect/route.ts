import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Create a simple HTML page that redirects to the static embed
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Loading Widget...</title>
<style>
body { 
  font-family: Arial, sans-serif; 
  text-align: center; 
  padding: 50px; 
  background: #f5f5f5; 
}
.loading { 
  font-size: 18px; 
  color: #666; 
}
</style>
</head>
<body>
<div class="loading">Loading widget...</div>
<script>
// Try to redirect to the static embed
window.location.href = '/w/${slug}/embed-static';
</script>
<noscript>
<p>Please enable JavaScript or use this direct link:</p>
<a href="/w/${slug}/embed-static">View Widget</a>
</noscript>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'ALLOWALL',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
