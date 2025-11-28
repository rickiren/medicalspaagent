import React from 'react';
import { PreviewLandingPageData } from '../types';

interface PreviewDataViewerProps {
  previewData: PreviewLandingPageData | null;
  businessName: string;
}

const PreviewDataViewer: React.FC<PreviewDataViewerProps> = ({ previewData, businessName }) => {
  if (!previewData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No preview data available. Scrape the website to generate preview landing page data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview Landing Page Data</h3>
        
        {/* Logo */}
        {previewData.logo && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
            <img src={previewData.logo} alt="Logo" className="h-16 object-contain" />
            <p className="text-xs text-slate-500 mt-1">{previewData.logo}</p>
          </div>
        )}

        {/* Colors */}
        {previewData.colors && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Brand Colors</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(previewData.colors).map(([key, value]) => (
                value && (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-slate-300"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-xs text-slate-600 capitalize">{key}: {value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Hero */}
        {previewData.hero && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Hero Section</label>
            <div className="space-y-2">
              {previewData.hero.title && (
                <p className="text-sm text-slate-900"><strong>Title:</strong> {previewData.hero.title}</p>
              )}
              {previewData.hero.subtitle && (
                <p className="text-sm text-slate-600"><strong>Subtitle:</strong> {previewData.hero.subtitle}</p>
              )}
              {previewData.hero.image && (
                <div>
                  <img src={previewData.hero.image} alt="Hero" className="w-full h-48 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        {previewData.navigation && previewData.navigation.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Navigation</label>
            <div className="flex flex-wrap gap-2">
              {previewData.navigation.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 rounded text-sm text-slate-700">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {previewData.sections && previewData.sections.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Sections</label>
            <div className="space-y-3">
              {previewData.sections.map((section, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-sm font-medium text-slate-900 capitalize">{section.type}</p>
                  {section.title && <p className="text-sm text-slate-700">{section.title}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {previewData.images && previewData.images.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Images ({previewData.images.length})
            </label>
            <div className="grid grid-cols-4 gap-2">
              {previewData.images.slice(0, 8).map((img, idx) => (
                <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-full h-20 object-cover rounded" />
              ))}
            </div>
          </div>
        )}

        {/* JSON Preview */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
            View Raw JSON
          </summary>
          <pre className="mt-2 p-4 bg-slate-50 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default PreviewDataViewer;

