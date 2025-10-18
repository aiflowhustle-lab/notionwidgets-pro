'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, HelpCircle, ExternalLink } from 'lucide-react';
import { CreateWidgetRequest } from '@/types';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';

interface CreateWidgetModalProps {
  onClose: () => void;
  onSuccess: (widget: any) => void;
}

export default function CreateWidgetModal({ onClose, onSuccess }: CreateWidgetModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateWidgetRequest>({
    name: '',
    token: '',
    databaseId: '',
    settings: {
      gridColumns: 3,
      defaultPlatform: '',
      defaultStatus: '',
      aspectRatio: 'square',
    },
  });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get Firebase ID token
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/widgets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create widget');
      }

      const widget = await response.json();
      onSuccess(widget);
    } catch (error) {
      console.error('Error creating widget:', error);
      setError(error instanceof Error ? error.message : 'Failed to create widget');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Widget</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Widget Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="My Image Gallery"
                required
              />
            </div>

            {/* Notion Integration Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notion Integration Token
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Get token
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={formData.token}
                  onChange={(e) => handleInputChange('token', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="secret_..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Database ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notion Database ID
                <a
                  href="https://www.notion.so/help/finding-your-database-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  How to find
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </label>
              <input
                type="text"
                value={formData.databaseId}
                onChange={(e) => handleInputChange('databaseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="286696474ba4818e9699c5e4a99f410a"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Extract from your Notion database URL: https://www.notion.so/[DATABASE_ID]
              </p>
            </div>


            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Widget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
