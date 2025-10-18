import { notFound } from 'next/navigation';

interface EmbedPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: EmbedPageProps) {
  return {
    title: `Widget Embed - ${params.slug}`,
    description: 'Notion Widget Embed',
  };
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          overflow: hidden;
        }
        
        .widget-iframe {
          width: 100vw;
          height: 100vh;
          border: none;
          display: block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <iframe 
        className="widget-iframe"
        src={`/w/${slug}`}
        allow="fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="eager"
        onLoad={() => {
          const loading = document.getElementById('loading');
          if (loading) {
            loading.style.display = 'none';
          }
        }}
        onError={() => {
          const loading = document.getElementById('loading');
          if (loading) {
            loading.innerHTML = '<div style="color: #ff6b6b;">Failed to load widget</div>';
          }
        }}
      />
      
      <div id="loading" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }}></div>
        <div>Loading widget...</div>
      </div>
    </div>
  );
}
