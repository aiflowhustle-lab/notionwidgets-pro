'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Widget } from '@/types';
import { getWidget } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Check, Copy, ExternalLink, Code, Trash2, Edit, Eye } from 'lucide-react';

export default function WidgetResultsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadWidget();
  }, [slug]);

  const loadWidget = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const widgetData = await getWidget(slug);
      if (!widgetData) {
        throw new Error('Widget not found');
      }
      
      setWidget(widgetData);
    } catch (error) {
      console.error('Error loading widget:', error);
      setError(error instanceof Error ? error.message : 'Failed to load widget');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await copyToClipboard(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async () => {
    if (!widget || !confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    try {
      const response = await fetch(`/api/widgets/by-id/${widget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to delete widget');
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert('Failed to delete widget. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (error || !widget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Widget Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The widget you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const widgetUrl = `${window.location.origin}/w/${widget.slug}`;
  const embedCode = `<iframe src="${widgetUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <Check className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">Widget Created Successfully!</h3>
            <p className="text-green-700">Your widget is now live and ready to be embedded anywhere.</p>
          </div>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
          <a
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in new tab
          </a>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={widgetUrl}
            width="100%"
            height="600"
            frameBorder="0"
            className="w-full"
          />
        </div>
      </div>

      {/* Widget Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Widget URL */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget URL</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direct Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={widgetUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => handleCopy(widgetUrl, 'url')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Share this URL to display your widget anywhere on the web.</p>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML iframe
              </label>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => handleCopy(embedCode, 'embed')}
                  className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {copied === 'embed' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Copy this code to embed the widget in your website or Notion page.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{widget.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <p className="text-gray-900 font-mono text-sm">{widget.slug}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Database ID</label>
            <p className="text-gray-900 font-mono text-sm">{widget.databaseId.slice(0, 8)}...</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
            <p className="text-gray-900 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {widget.views}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use Your Widget</h3>
        <div className="space-y-4 text-blue-800">
          <div>
            <h4 className="font-medium mb-2">1. Share the URL</h4>
            <p className="text-sm">Copy the widget URL and share it directly with anyone you want to see your images.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Embed in Websites</h4>
            <p className="text-sm">Use the embed code to display your widget on any website or blog.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Embed in Notion</h4>
            <p className="text-sm">In Notion, create an "Embed" block and paste the widget URL to display it inline.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Auto-Sync</h4>
            <p className="text-sm">Your widget automatically updates when you add new images to your Notion database.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/w/${widget.slug}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Widget
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Widget
          </button>
        </div>
      </div>
    </div>
  );
}
