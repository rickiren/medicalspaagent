import React, { useState, useEffect } from 'react';
import { BusinessConfig } from '../types';
import BusinessList from './BusinessList';
import BusinessEditor from './BusinessEditor';
import WebsiteScraper from './WebsiteScraper';
import WidgetPreview from './WidgetPreview';

type View = 'list' | 'edit' | 'create' | 'scrape' | 'preview';

interface DashboardProps {
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('list');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [scrapedConfig, setScrapedConfig] = useState<{ config: BusinessConfig; domain: string } | null>(null);

  const handleCreateNew = () => {
    setSelectedBusinessId(null);
    setView('create');
  };

  const handleEdit = (id: string) => {
    setSelectedBusinessId(id);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedBusinessId(null);
  };

  const handleSave = () => {
    // Refresh list after save
    setView('list');
    setSelectedBusinessId(null);
    setScrapedConfig(null);
  };

  const handleScrapeWebsite = () => {
    setView('scrape');
  };

  const handleScrapeComplete = async (config: BusinessConfig, domain: string) => {
    setScrapedConfig({ config, domain });
    setSelectedBusinessId(config.id);
    setView('create');
  };

  const handleScrapeCancel = () => {
    setView('list');
    setScrapedConfig(null);
  };

  const handlePreview = (id: string, name: string) => {
    setSelectedBusinessId(id);
    setSelectedBusinessName(name);
    setView('preview');
  };

  const handlePreviewBack = () => {
    setView('list');
    setSelectedBusinessId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {view !== 'preview' && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Back to Landing Page"
                  >
                    ← Back
                  </button>
                )}
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              </div>
              {view === 'list' && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleScrapeWebsite}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Scrape Website
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
                  >
                    Create Manually
                  </button>
                </div>
              )}
              {view !== 'list' && (
                <button
                  onClick={handleBackToList}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                >
                  ← Back to List
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'preview' && selectedBusinessId ? (
        <WidgetPreview
          businessId={selectedBusinessId}
          businessName={selectedBusinessName}
          onBack={handlePreviewBack}
        />
      ) : (
        <div className="container mx-auto px-6 py-8">
          {view === 'list' && (
            <BusinessList 
              onEdit={handleEdit} 
              onCreateNew={handleCreateNew}
              onScrapeWebsite={handleScrapeWebsite}
              onPreview={handlePreview}
            />
          )}
          {view === 'scrape' && (
            <WebsiteScraper
              onScrapeComplete={handleScrapeComplete}
              onCancel={handleScrapeCancel}
            />
          )}
          {(view === 'edit' || view === 'create') && (
            <BusinessEditor
              businessId={selectedBusinessId}
              mode={view}
              onSave={handleSave}
              onCancel={handleBackToList}
              initialConfig={scrapedConfig?.config}
              initialDomain={scrapedConfig?.domain}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

