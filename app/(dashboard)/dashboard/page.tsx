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
    // Stay on dashboard to show the new widget in the cards view
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

  const copyStaticUrl = async (slug: string) => {
    const url = `${window.location.origin}/w/${slug}/static`;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy static URL:', error);
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
            Manage your Notion widgets and create new ones.
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

        {/* Widgets Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        Database: {widget.databaseId.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        widget.isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/10 text-white/70'
                      }`}>
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/70 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(widget.createdAt)}
                    </div>
                  </div>

                  {/* Widget URLs Section */}
                  <div className="mb-4 space-y-3">
                    {/* Standard URL */}
                    <div className="p-3 bg-white/5 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2">Standard URL (Desktop/Web)</h4>
                      <div className="flex">
                        <input
                          type="text"
                          value={`${window.location.origin}/w/${widget.slug}`}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs bg-white/10 text-white rounded-l border border-white/20 focus:outline-none"
                        />
                        <button
                          onClick={() => copyWidgetUrl(widget.slug)}
                          className="px-3 py-1 bg-white/20 text-white rounded-r border border-l-0 border-white/20 hover:bg-white/30 transition-colors text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* iPad Compatible URL */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                        <span className="mr-2">📱</span>
                        iPad Compatible URL (Static)
                      </h4>
                      <div className="flex">
                        <input
                          type="text"
                          value={`${window.location.origin}/w/${widget.slug}/static`}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs bg-white/10 text-white rounded-l border border-white/20 focus:outline-none"
                        />
                        <button
                          onClick={() => copyStaticUrl(widget.slug)}
                          className="px-3 py-1 bg-blue-500/20 text-white rounded-r border border-l-0 border-white/20 hover:bg-blue-500/30 transition-colors text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-blue-300/80 mt-1">
                        Use this URL for iPad/iPhone Notion app compatibility
                      </p>
                    </div>
                  </div>

                  {/* Notion Embed Instructions */}
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">Add to Your Notion Page</h4>
                    <div className="text-xs text-white/70 space-y-1">
                      <p>1. Type <code className="bg-white/10 px-1 rounded">/embed</code> in Notion</p>
                      <p>2. Click "Embed link"</p>
                      <p>3. Paste your widget URL:</p>
                      <ul className="ml-4 space-y-1">
                        <li>• <strong>Desktop/Web:</strong> Use Standard URL</li>
                        <li>• <strong>iPad/iPhone:</strong> Use iPad Compatible URL</li>
                      </ul>
                      <p>4. Click "Create embed"</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/w/${widget.slug}`)}
                      className="flex-1 px-3 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="px-3 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      title="Delete Widget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
