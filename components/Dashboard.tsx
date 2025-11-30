import React, { useState, useEffect } from 'react';
import { BusinessConfig } from '../types';
import BusinessList from './BusinessList';
import BusinessEditor from './BusinessEditor';
import WebsiteScraper from './WebsiteScraper';
import WidgetPreview from './WidgetPreview';
import EmailGenerator from './EmailGenerator';
import LeadsList from './LeadsList';

type View = 'list' | 'edit' | 'create' | 'scrape' | 'preview' | 'email' | 'leads';
type Tab = 'businesses' | 'leads';

interface DashboardProps {
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState<Tab>('businesses');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [selectedBusinessDomain, setSelectedBusinessDomain] = useState<string | null>(null);
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

  const handlePreview = (id: string, name: string, domain: string | null) => {
    setSelectedBusinessId(id);
    setSelectedBusinessName(name);
    setSelectedBusinessDomain(domain);
    setView('preview');
  };

  const handlePreviewBack = () => {
    setView('list');
    setSelectedBusinessId(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0f1016] text-white selection:bg-rose-500/30 font-sans">
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      {/* --- Grid Overlay --- */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none"></div>

      {view !== 'preview' && (
        <div className="relative z-50 w-full border-b border-white/10 bg-slate-900/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    title="Back to Landing Page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Back
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
                </div>
              </div>
              {view === 'list' && activeTab === 'businesses' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('email')}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
                  >
                    Email Generator
                  </button>
                  <button
                    onClick={handleScrapeWebsite}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
                  >
                    Scrape Website
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
                  >
                    Create Manually
                  </button>
                </div>
              )}
              {view !== 'list' && view !== 'preview' && (
                <button
                  onClick={view === 'email' ? () => setView('list') : handleBackToList}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
                >
                  ← Back to List
                </button>
              )}
            </div>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10">
              <button
                onClick={() => {
                  setActiveTab('businesses');
                  setView('list');
                }}
                className={`px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'businesses'
                    ? 'text-white border-b-2 border-rose-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Businesses
              </button>
              <button
                onClick={() => {
                  setActiveTab('leads');
                  setView('leads');
                }}
                className={`px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'leads'
                    ? 'text-white border-b-2 border-rose-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'preview' && selectedBusinessId ? (
        <WidgetPreview
          businessId={selectedBusinessId}
          businessName={selectedBusinessName}
          businessDomain={selectedBusinessDomain}
          onBack={handlePreviewBack}
        />
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {view === 'list' && activeTab === 'businesses' && (
            <BusinessList 
              onEdit={handleEdit} 
              onCreateNew={handleCreateNew}
              onScrapeWebsite={handleScrapeWebsite}
              onPreview={handlePreview}
            />
          )}
          {view === 'leads' && activeTab === 'leads' && (
            <LeadsList onScrapeQueue={() => {}} />
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
          {view === 'email' && (
            <EmailGenerator />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

