import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceWidget from './VoiceWidget';
import PreviewLandingPage from './PreviewLandingPage';
import { PreviewLandingPageData } from '../types';
import { slugify } from '../utils/slugify';

const BusinessPreviewPage: React.FC = () => {
  const { businessName } = useParams<{ businessName: string }>();
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [actualBusinessName, setActualBusinessName] = useState<string>('');
  const [businessDomain, setBusinessDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewLandingPageData | null>(null);

  // Find business by name (slugified)
  useEffect(() => {
    const findBusiness = async () => {
      if (!businessName) {
        setError('Business name not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch all businesses and find the one matching the slugified name
        const response = await fetch('/api/businesses');
        if (!response.ok) {
          throw new Error('Failed to load businesses');
        }
        
        const businesses = await response.json();
        
        // Find business by matching slugified name or ID
        const business = businesses.find((b: any) => 
          slugify(b.name) === businessName || b.id === businessName
        );
        
        if (!business) {
          setError(`Business "${businessName}" not found`);
          setLoading(false);
          return;
        }
        
        setBusinessId(business.id);
        setActualBusinessName(business.name);
        setBusinessDomain(business.domain);
      } catch (err: any) {
        console.error('Error finding business:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    findBusiness();
  }, [businessName]);

  // Fetch business preview data once we have the ID
  useEffect(() => {
    if (!businessId) return;

    const fetchBusinessData = async () => {
      setLoading(true);
      setError(null);
      console.log('[PREVIEW] Fetching business data for:', businessId);
      try {
        const response = await fetch(`/api/businesses/${businessId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch business data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const screenshotUrl = data.preview_screenshot_url || null;
        const previewData = data.preview_data_json || null;
        
        setPreviewScreenshotUrl(screenshotUrl);
        setPreviewData(previewData);
      } catch (err: any) {
        console.error('[PREVIEW] Error fetching business data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId]);

  const handleRegenerateScreenshot = async () => {
    if (!businessId || !businessDomain) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = `https://${businessDomain}`;
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, businessId, domain: businessDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Screenshot regeneration failed');
      }

      const result = await response.json();
      setPreviewScreenshotUrl(result.screenshotUrl || null);
      setPreviewData(result.previewData || null);
      alert('Screenshot regenerated successfully!');
    } catch (err: any) {
      console.error('[PREVIEW] Regenerate error:', err);
      setError(err.message);
      alert(`Error regenerating screenshot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !businessId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business...</p>
        </div>
      </div>
    );
  }

  if (error && !businessId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview for {actualBusinessName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col">
      {/* Preview Mode Banner */}
      <div className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 text-sm z-50 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Preview Mode — This is a static mockup of the client's homepage</span>
          <span className="text-xs opacity-90">Business: {actualBusinessName}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRegenerateScreenshot}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            disabled={loading}
          >
            Regenerate Screenshot
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main content area for screenshot or fallback */}
      <div className="relative flex-grow overflow-y-auto">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 z-40 p-4">
            <div className="text-center text-red-800">
              <p className="font-bold mb-2">Error loading preview:</p>
              <p>{error}</p>
              <button
                onClick={handleRegenerateScreenshot}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Regenerate Screenshot
              </button>
            </div>
          </div>
        )}

        {previewScreenshotUrl ? (
          <div className="relative w-full min-h-full overflow-y-auto">
            <div
              className="relative w-full bg-cover bg-top bg-no-repeat"
              style={{ 
                backgroundImage: `url(${previewScreenshotUrl})`,
                minHeight: '100vh'
              }}
            >
              <img
                src={previewScreenshotUrl}
                alt=""
                className="hidden"
                onError={() => {
                  console.error('Failed to load screenshot:', previewScreenshotUrl);
                  setError(`Screenshot not found. Please regenerate.`);
                }}
              />
              <div className="sticky bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            </div>
          </div>
        ) : previewData ? (
          <PreviewLandingPage data={previewData} businessName={actualBusinessName} />
        ) : (
          <div className="flex items-center justify-center min-h-full bg-gray-100 text-gray-600">
            No screenshot or preview data available. Scrape the website or regenerate screenshot.
          </div>
        )}
      </div>

      {/* AI Widget - positioned absolutely over the screenshot/fallback */}
      {businessId && (
        <div className="absolute bottom-6 right-6 z-50">
          <VoiceWidget businessId={businessId} />
        </div>
      )}
    </div>
  );
};

export default BusinessPreviewPage;

