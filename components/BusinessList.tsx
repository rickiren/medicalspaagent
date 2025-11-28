import React, { useState, useEffect } from 'react';

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
      const response = await fetch('/api/businesses');
      if (!response.ok) {
        throw new Error('Failed to load businesses');
      }
      const data = await response.json();
      setBusinesses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
        <div className="text-slate-500">Loading businesses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
        <button
          onClick={loadBusinesses}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">All Businesses</h2>
        <p className="text-slate-600">Manage your AI receptionist configurations</p>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">No businesses found</p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onScrapeWebsite}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Scrape Website
            </button>
            <button
              onClick={onCreateNew}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {businesses.map((business) => (
                <tr key={business.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{business.name}</div>
                    <div className="text-sm text-slate-500">ID: {business.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {business.domain || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(business.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onPreview(business.id, business.name, business.domain)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => onEdit(business.id)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(business.id, business.name)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
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

