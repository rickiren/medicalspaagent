import React, { useState, useEffect } from 'react';
import { slugify } from '../utils/slugify';

interface Business {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

interface BusinessListProps {
  onEdit: (id: string) => void;
  onCreateNew: () => void;
  onScrapeWebsite: () => void;
  onPreview: (id: string, name: string, domain: string | null) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ onEdit, onCreateNew, onScrapeWebsite, onPreview }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/businesses');
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse as JSON, but handle plain text errors
        let errorData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const errorText = await response.text();
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || errorData.message || `Failed to load businesses (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setBusinesses(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load businesses';
      setError(errorMessage);
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete business');
      }

      // Reload list
      loadBusinesses();
    } catch (err: any) {
      alert(`Error deleting business: ${err.message}`);
      console.error('Error deleting business:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400 animate-pulse">Loading businesses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card border border-red-500/30 rounded-2xl p-6">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button
          onClick={loadBusinesses}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">All Businesses</h2>
        <p className="text-slate-400">Manage your AI receptionist configurations</p>
      </div>

      {businesses.length === 0 ? (
        <div className="glass-card border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-6">No businesses found</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onScrapeWebsite}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
            >
              Scrape Website
            </button>
            <button
              onClick={onCreateNew}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
            >
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {businesses.map((business) => (
                <tr key={business.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">{business.name}</div>
                    <div className="text-sm text-slate-400">ID: {business.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {business.domain || <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {new Date(business.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/business/${slugify(business.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all inline-block cursor-pointer"
                        title={`Open preview: /business/${slugify(business.name)}`}
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/business/${slugify(business.name)}`;
                          navigator.clipboard.writeText(url).then(() => {
                            alert(`Link copied to clipboard!\n\n${url}`);
                          }).catch(() => {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = url;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            alert(`Link copied to clipboard!\n\n${url}`);
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all"
                        title="Copy shareable link"
                        style={{ display: 'block' }}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => onEdit(business.id)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(business.id, business.name)}
                        className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BusinessList;

