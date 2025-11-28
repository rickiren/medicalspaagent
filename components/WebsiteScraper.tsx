import React, { useState } from 'react';
import { BusinessConfig } from '../types';

interface WebsiteScraperProps {
  onScrapeComplete: (config: BusinessConfig, domain: string) => void;
  onCancel: () => void;
}

const WebsiteScraper: React.FC<WebsiteScraperProps> = ({ onScrapeComplete, onCancel }) => {
  const [url, setUrl] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  };

  const generateBusinessId = (url: string): string => {
    const domain = extractDomain(url);
    // Convert domain to business ID: lowercase, replace dots and special chars with hyphens
    return domain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric (except hyphens) with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl.trim()) {
      const autoId = generateBusinessId(newUrl);
      setBusinessId(autoId);
    } else {
      setBusinessId('');
    }
  };

  const handleScrape = async () => {
    if (!url || !businessId) {
      setError('Please provide both website URL and Business ID');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Scraping website...');

    try {
      const domain = extractDomain(url);
      setStatus(`Scraping ${domain}...`);

      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, businessId, domain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scraping failed');
      }

      setStatus('Normalizing data...');
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setStatus('Complete!');
      onScrapeComplete(result.config, domain);
    } catch (err: any) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Scrape Website</h2>
        <p className="text-sm text-slate-600 mb-6">
          Enter a website URL and we'll automatically extract business information to create your AI receptionist.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Website URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example-medspa.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business ID
            </label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                setBusinessId(value);
              }}
              placeholder="example-medspa"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-slate-50"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Auto-generated from domain (editable if needed)
            </p>
          </div>

          {status && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">{status}</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleScrape}
              disabled={loading || !url || !businessId}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scraping...' : 'Scrape & Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteScraper;

