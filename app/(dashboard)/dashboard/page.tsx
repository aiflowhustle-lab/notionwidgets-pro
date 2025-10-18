'use client';

import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Widget } from '@/types';
import { getUserWidgets } from '@/lib/firestore';
import { formatDate, formatNumber } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { Plus, Eye, Copy, Trash2, ExternalLink, Calendar, BarChart3 } from 'lucide-react';
import CreateWidgetModal from '@/components/CreateWidgetModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadWidgets();
    }
  }, [user]);

  const loadWidgets = async () => {
    try {
      setLoading(true);
      const userWidgets = await getUserWidgets(user!.uid);
      setWidgets(userWidgets);
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWidget = () => {
    setShowCreateModal(true);
  };

  const handleWidgetCreated = (newWidget: Widget) => {
    setWidgets(prev => [newWidget, ...prev]);
    setShowCreateModal(false);
    router.push(`/dashboard/widget/${newWidget.slug}`);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    if (!user) {
      alert('You must be logged in to delete widgets');
      return;
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        alert('You must be logged in to delete widgets');
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('Attempting to delete widget:', widgetId);
      console.log('User token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`/api/widgets/by-id/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);
      
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = { error: 'Empty response from server' };
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        responseData = { error: 'Invalid response from server' };
      }
      
      console.log('Delete response data:', responseData);

      if (response.ok) {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        console.log('Widget deleted successfully from UI');
      } else {
        throw new Error(`Failed to delete widget: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert(`Failed to delete widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyWidgetUrl = async (slug: string) => {
    const url = `${window.location.origin}/w/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const copyEmbedCode = async (slug: string) => {
    const embedCode = `<iframe src="${window.location.origin}/w/${slug}" width="100%" height="600" frameborder="0"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="h-6 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.displayName || 'User'}!
          </h1>
          <p className="text-white/70 mt-2">
            Manage your Notion image widgets and create new ones.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Widgets</p>
                <p className="text-2xl font-bold text-white">{widgets.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Active Widgets</p>
                <p className="text-2xl font-bold text-white">
                  {widgets.filter(w => w.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Widget Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Your Widgets</h2>
          <button
            onClick={handleCreateWidget}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Widget
          </button>
        </div>

        {/* Widgets Preview */}
        {widgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No widgets yet</h3>
            <p className="text-white/70 mb-6">Create your first widget to get started.</p>
            <button
              onClick={handleCreateWidget}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all"
            >
              Create Your First Widget
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Widget Preview Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{widget.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        widget.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/w/${widget.slug}`, '_blank')}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in new tab
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">LIVE PREVIEW</h4>
                    <button
                      onClick={() => window.open(`/w/${widget.slug}`, '_blank')}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open in new tab
                    </button>
                  </div>
                  
                  {/* Widget Preview Frame */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Refresh Button */}
                      <div className="p-4 border-b border-gray-200">
                        <button className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refresh</span>
                        </button>
                      </div>
                      
                      {/* Widget Content Preview */}
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 max-w-3xl mx-auto">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Preview {i}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copy Widget URL Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Copy Your Widget URL</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/w/${widget.slug}`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                      />
                      <button
                        onClick={() => copyWidgetUrl(widget.slug)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Add to Notion Page Instructions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add to Your Notion Page</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                        Type /embed in Notion
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                        Click "Embed link"
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                        Paste your widget URL
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                        Click "Create embed"
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(widget.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {widget.views || 0} views
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyEmbedCode(widget.slug)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copy Embed Code"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Embed Code
                      </button>
                      <button
                        onClick={() => handleDeleteWidget(widget.id)}
                        className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete Widget"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Widget Modal */}
      {showCreateModal && (
        <CreateWidgetModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleWidgetCreated}
        />
      )}
    </div>
  );
}
