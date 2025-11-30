import React, { useState, useEffect } from 'react';

interface InstagramLead {
  id: string;
  name: string;
  instagram_handle: string | null;
  personalized_message: string | null;
  outreach_status: string;
  follow_status: string | null;
  created_at: string;
  updated_at: string;
}

const InstagramOutreachBot: React.FC = () => {
  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initial load with loading state
    const initialLoad = async () => {
      setLoading(true);
      await loadLeads();
      setLoading(false);
    };
    initialLoad();
    
    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        setRefreshing(true);
        loadLeads().finally(() => setRefreshing(false));
      }, 10000); // Refresh every 10 seconds when auto-refresh is on
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLeads = async () => {
    try {
      setError(null);
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load leads (${response.status})`);
      }
      
      const data = await response.json();
      // Filter to only show leads with Instagram outreach data
      const instagramLeads = data.filter((lead: any) => 
        lead.instagram_handle || lead.personalized_message || lead.outreach_status || lead.follow_status
      );
      setLeads(instagramLeads);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load leads';
      setError(errorMessage);
      console.error('Error loading leads:', err);
    }
  };

  const handleResetFailed = async (leadId: string) => {
    if (!confirm('Reset this failed lead back to pending so it can be retried?')) {
      return;
    }

    try {
      const response = await fetch('/api/instagram-outreach/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: 'pending' })
      });

      if (!response.ok) {
        throw new Error('Failed to reset lead');
      }

      await loadLeads();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResetFollowFailed = async (leadId: string) => {
    if (!confirm('Reset this failed follow back to pending so it can be retried?')) {
      return;
    }

    try {
      const response = await fetch('/api/instagram-outreach/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: 'pending', type: 'follow' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset follow');
      }

      await loadLeads();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      sent: 'bg-green-500/20 text-green-300 border-green-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${colorClass}`}>
        {status || 'pending'}
      </span>
    );
  };

  const pendingCount = leads.filter(l => l.outreach_status === 'pending').length;
  const sentCount = leads.filter(l => l.outreach_status === 'sent').length;
  const failedCount = leads.filter(l => l.outreach_status === 'failed').length;
  const followPendingCount = leads.filter(l => l.follow_status === 'pending').length;
  const followedCount = leads.filter(l => l.follow_status === 'followed').length;
  const followFailedCount = leads.filter(l => l.follow_status === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400 animate-pulse">Loading Instagram outreach leads...</div>
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

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Instagram Outreach Bot</h2>
        <p className="text-slate-400">Manage Instagram DM outreach using the local bot script</p>
      </div>

      {/* Bot Controls */}
      <div className="glass-card border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg mb-1">Bot Controls</h3>
            <p className="text-slate-400 text-sm">Start bot scripts locally to automate Instagram actions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const command = 'node scripts/instagramOutreachBot.js';
                navigator.clipboard.writeText(command);
                alert('Command copied to clipboard!');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <path d="M12 11h4"/>
                <path d="M12 16h4"/>
                <path d="M8 11h.01"/>
                <path d="M8 16h.01"/>
              </svg>
              Send DMs
            </button>
            <button
              onClick={() => {
                const command = 'node scripts/instagramFollowBot.js';
                navigator.clipboard.writeText(command);
                alert('Command copied to clipboard!');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Follow Accounts
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2.5 rounded-lg transition-all font-semibold flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30'
                  : 'bg-slate-500/20 border border-slate-500/50 text-slate-300 hover:bg-slate-500/30'
              }`}
            >
              {autoRefresh ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Auto-Refresh On
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Auto-Refresh Off
                </>
              )}
            </button>
            <button
              onClick={() => {
                setRefreshing(true);
                loadLeads().finally(() => setRefreshing(false));
              }}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''}>
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
          <div className="text-slate-300 text-sm space-y-2">
            <p className="font-semibold text-white mb-2">Quick Start:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Make sure Android emulator is running and Instagram is logged in</li>
              <li>Click "Send DMs" or "Follow Accounts" button above</li>
              <li>Open Terminal and paste the command</li>
              <li>Bots will process all <span className="text-yellow-400 font-semibold">pending</span> leads automatically</li>
              <li>Leads marked as <span className="text-green-400 font-semibold">sent</span> or <span className="text-green-400 font-semibold">followed</span> will never be processed again (prevents duplicates)</li>
              <li>Bots can resume from where they left off - they skip already processed leads</li>
            </ol>
            <p className="mt-3 text-slate-400 italic text-xs">
              💡 Tip: Keep auto-refresh on to see real-time updates as the bot processes leads
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">DM Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">DM Sent</div>
          <div className="text-2xl font-bold text-green-400">{sentCount}</div>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">DM Failed</div>
          <div className="text-2xl font-bold text-red-400">{failedCount}</div>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">Follow Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{followPendingCount}</div>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">Followed</div>
          <div className="text-2xl font-bold text-green-400">{followedCount}</div>
        </div>
        <div className="glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-slate-400 text-sm mb-1">Follow Failed</div>
          <div className="text-2xl font-bold text-red-400">{followFailedCount}</div>
        </div>
      </div>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="glass-card border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
          <p className="text-slate-400 mb-6">No leads with Instagram outreach data found</p>
          <p className="text-slate-500 text-sm">Add instagram_handle and personalized_message to leads to see them here</p>
        </div>
      ) : (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Instagram Handle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Message Preview
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  DM Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Following
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => {
                const status = lead.outreach_status || 'pending';
                const followStatus = lead.follow_status || 'pending';
                const isSent = status === 'sent';
                const isFailed = status === 'failed';
                const isFollowed = followStatus === 'followed';
                const isFollowFailed = followStatus === 'failed';
                
                return (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-white/5 transition-colors ${
                      isSent && isFollowed ? 'opacity-75' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isSent && isFollowed && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        )}
                        <div>
                          <div className="font-medium text-white">{lead.name}</div>
                          <div className="text-sm text-slate-400">ID: {lead.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {lead.instagram_handle ? (
                        <a 
                          href={`https://instagram.com/${lead.instagram_handle.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-pink-400 hover:text-pink-300 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                          </svg>
                          @{lead.instagram_handle.replace('@', '')}
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
                      {lead.personalized_message ? (
                        <div className="truncate" title={lead.personalized_message}>
                          {lead.personalized_message}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isFollowed ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                          Yes
                        </span>
                      ) : isFollowFailed ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {lead.updated_at ? (
                        <div>
                          <div>{new Date(lead.updated_at).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{new Date(lead.updated_at).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isFailed && (
                          <button
                            onClick={() => handleResetFailed(lead.id)}
                            className="px-3 py-1.5 text-xs bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all"
                            title="Retry DM"
                          >
                            Retry DM
                          </button>
                        )}
                        {isFollowFailed && (
                          <button
                            onClick={() => handleResetFollowFailed(lead.id)}
                            className="px-3 py-1.5 text-xs bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                            title="Retry Follow"
                          >
                            Retry Follow
                          </button>
                        )}
                        {isSent && !isFailed && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            Sent
                          </span>
                        )}
                      </div>
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

export default InstagramOutreachBot;

