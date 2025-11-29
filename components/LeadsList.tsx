import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  website: string | null;
  domain: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface QueueItem {
  id: string;
  leadId: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

interface LeadsListProps {
  onScrapeQueue: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ onScrapeQueue }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLeads();
    loadQueue();
    // Poll queue status every 5 seconds
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load leads (${response.status})`);
      }
      
      const data = await response.json();
      setLeads(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load leads';
      setError(errorMessage);
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQueue = async () => {
    try {
      const response = await fetch('/api/scrape-queue');
      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
  };

  const handleAddToQueue = async (leadId: string, url: string) => {
    if (!url) {
      alert('This lead does not have a website URL');
      return;
    }

    try {
      setQueueLoading(true);
      const response = await fetch('/api/scrape-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          leadId,
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to queue');
      }

      await loadQueue();
      alert('Lead added to scrape queue!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error('Error adding to queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setQueueLoading(true);
      const response = await fetch('/api/scrape-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'process',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process queue');
      }

      await loadQueue();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error('Error processing queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleRemoveFromQueue = async (queueId: string) => {
    if (!confirm('Remove this item from the queue?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scrape-queue?id=${queueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from queue');
      }

      await loadQueue();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error('Error removing from queue:', err);
    }
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkAddToQueue = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select at least one lead');
      return;
    }

    const leadsToAdd = leads.filter(lead => selectedLeads.has(lead.id) && lead.website);
    if (leadsToAdd.length === 0) {
      alert('Selected leads must have a website URL');
      return;
    }

    try {
      setQueueLoading(true);
      let added = 0;
      let skipped = 0;

      for (const lead of leadsToAdd) {
        try {
          const response = await fetch('/api/scrape-queue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'add',
              leadId: lead.id,
              url: lead.website!,
            }),
          });

          if (response.ok) {
            added++;
          } else {
            skipped++;
          }
        } catch (err) {
          skipped++;
        }
      }

      await loadQueue();
      setSelectedLeads(new Set());
      alert(`Added ${added} leads to queue${skipped > 0 ? `, ${skipped} skipped` : ''}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setQueueLoading(false);
    }
  };

  const getQueueStatusForLead = (leadId: string) => {
    return queue.find(item => item.leadId === leadId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400 animate-pulse">Loading leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card border border-red-500/30 rounded-2xl p-6">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button
          onClick={loadLeads}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = queue.filter(item => item.status === 'pending').length;
  const processingCount = queue.filter(item => item.status === 'processing').length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Leads</h2>
        <p className="text-slate-400">Manage your leads and trigger Firecrawl scrapes</p>
      </div>

      {/* Queue Status */}
      {queue.length > 0 && (
        <div className="glass-card border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-lg">Scrape Queue</h3>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-400">
                <span className="text-yellow-400">{pendingCount} pending</span>
                {' • '}
                <span className="text-blue-400">{processingCount} processing</span>
                {' • '}
                <span className="text-green-400">{queue.filter(item => item.status === 'completed').length} completed</span>
              </div>
              {pendingCount > 0 && (
                <button
                  onClick={handleProcessQueue}
                  disabled={queueLoading || processingCount > 0}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {queueLoading ? 'Processing...' : 'Process Next'}
                </button>
              )}
            </div>
          </div>
          {queue.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queue.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm text-white">
                      {leads.find(l => l.id === item.leadId)?.name || item.leadId}
                    </div>
                    <div className="text-xs text-slate-400">{item.url}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      item.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                      item.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {item.status}
                    </span>
                    {(item.status === 'pending' || item.status === 'failed') && (
                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="px-2 py-1 text-xs bg-red-500/20 border border-red-500/30 text-red-300 rounded hover:bg-red-500/30 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {queue.length > 5 && (
                <div className="text-xs text-slate-400 text-center pt-2">
                  +{queue.length - 5} more items
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={handleBulkAddToQueue}
            disabled={queueLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold disabled:opacity-50"
          >
            Add {selectedLeads.size} Selected to Queue
          </button>
          <button
            onClick={() => setSelectedLeads(new Set())}
            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="glass-card border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-6">No leads found</p>
        </div>
      ) : (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(new Set(leads.map(l => l.id)));
                      } else {
                        setSelectedLeads(new Set());
                      }
                    }}
                    className="rounded border-white/20"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Scrape Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => {
                const queueItem = getQueueStatusForLead(lead.id);
                return (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-white/20"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-sm text-slate-400">ID: {lead.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          {lead.domain || lead.website}
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div>{lead.phone || '—'}</div>
                      <div className="text-xs text-slate-400">{lead.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        lead.status === 'converted' ? 'bg-green-500/20 text-green-300' :
                        lead.status === 'qualified' ? 'bg-blue-500/20 text-blue-300' :
                        lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {queueItem ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          queueItem.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          queueItem.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                          queueItem.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {queueItem.status}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Not queued</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {lead.website && (
                        <button
                          onClick={() => handleAddToQueue(lead.id, lead.website!)}
                          disabled={queueLoading || !!queueItem}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {queueItem ? 'In Queue' : 'Add to Queue'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadsList;

