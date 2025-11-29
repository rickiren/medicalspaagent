import React, { useState, useEffect } from 'react';
import VoiceWidget from './VoiceWidget';
import PreviewLandingPage from './PreviewLandingPage';
import { PreviewLandingPageData } from '../types';

interface WidgetPreviewProps {
  businessId: string;
  businessName: string;
  businessDomain?: string | null;
  onBack: () => void;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ businessId, businessName, businessDomain, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewLandingPageData | null>(null);

  const fetchBusinessData = async () => {
    setLoading(true);
    setError(null);
    console.log('[PREVIEW] Fetching business data for:', businessId);
    try {
      // Use businesses endpoint (works in both local and Vercel)
      const response = await fetch(`/api/businesses/${businessId}`);
      console.log('[PREVIEW] API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[PREVIEW] API error response:', errorText);
        throw new Error(`Failed to fetch business data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[PREVIEW] Fetched business data:', { 
        businessId, 
        dataKeys: Object.keys(data),
        screenshotUrl: data.preview_screenshot_url,
        screenshotUrlType: typeof data.preview_screenshot_url,
        screenshotUrlValue: data.preview_screenshot_url,
        hasPreviewData: !!data.preview_data_json,
        fullData: data
      });
      
      // Use the database field names directly
      const screenshotUrl = data.preview_screenshot_url || null;
      const previewData = data.preview_data_json || null;
      
      console.log('[PREVIEW] Setting state:', { 
        screenshotUrl, 
        hasPreviewData: !!previewData,
        screenshotUrlLength: screenshotUrl?.length 
      });
      setPreviewScreenshotUrl(screenshotUrl);
      setPreviewData(previewData);
    } catch (err: any) {
      console.error('[PREVIEW] Error fetching business data:', err);
      console.error('[PREVIEW] Error details:', err.message, err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const handleRegenerateScreenshot = async () => {
    setLoading(true);
    setError(null);
    console.log('[PREVIEW] Regenerating screenshot for:', businessId);
    try {
      // Fetch current business to get its domain
      console.log('[PREVIEW] Fetching business domain...');
      const businessResponse = await fetch(`/api/businesses/${businessId}`);
      if (!businessResponse.ok) {
        throw new Error('Failed to fetch business domain for regeneration');
      }
      const business = await businessResponse.json();
      const domain = business.domain;
      const url = `https://${domain}`; // Assuming domain is stored without protocol
      console.log('[PREVIEW] Business domain:', domain, 'URL:', url);

      if (!domain) {
        throw new Error('Business domain not found. Cannot regenerate screenshot.');
      }

      console.log('[PREVIEW] Calling scrape-website API...');
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, businessId, domain }),
      });

      console.log('[PREVIEW] Scrape API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PREVIEW] Scrape API error:', errorData);
        throw new Error(errorData.error || 'Screenshot regeneration failed');
      }

      const result = await response.json();
      console.log('[PREVIEW] Scrape API result:', {
        hasConfig: !!result.config,
        screenshotUrl: result.screenshotUrl,
        screenshotUrlType: typeof result.screenshotUrl
      });
      setPreviewScreenshotUrl(result.screenshotUrl || null);
      setPreviewData(result.previewData || null); // Update preview data too
      alert('Screenshot regenerated successfully!');
    } catch (err: any) {
      console.error('[PREVIEW] Regenerate error:', err);
      console.error('[PREVIEW] Regenerate error details:', err.message, err.stack);
      setError(err.message);
      alert(`Error regenerating screenshot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview for {businessName}...</p>
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
          <span className="text-xs opacity-90">Business: {businessName}</span>
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
            onClick={onBack}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
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
              {/* Hidden img for error detection */}
              <img
                src={previewScreenshotUrl}
                alt=""
                className="hidden"
                onError={(e) => {
                  console.error('Failed to load screenshot:', previewScreenshotUrl);
                  setError(`Screenshot not found. Please regenerate.`);
                }}
                onLoad={() => {
                  console.log('Screenshot loaded successfully');
                }}
              />
              {/* Dark gradient overlay at the bottom for widget readability */}
              <div className="sticky bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            </div>
          </div>
        ) : previewData ? (
          <PreviewLandingPage data={previewData} businessName={businessName} />
        ) : (
          <div className="flex items-center justify-center min-h-full bg-gray-100 text-gray-600">
            No screenshot or preview data available. Scrape the website or regenerate screenshot.
          </div>
        )}
      </div>

      {/* Your AI Widget - positioned absolutely over the screenshot/fallback */}
      <div className="absolute bottom-6 right-6 z-50">
        <VoiceWidget businessId={businessId} />
      </div>
    </div>
  );
};

export default WidgetPreview;

