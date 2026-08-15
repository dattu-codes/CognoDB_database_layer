'use client';

import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { HealthStatus } from '@/lib/types';
import { Network, GitBranch, Database, Wrench, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  healthStatus: HealthStatus | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ healthStatus, healthLoading, onRefreshHealth }) => {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [showDevMenu, setShowDevMenu] = useState(false);

  const handleSeed = async () => {
    const confirmed = window.confirm(
      '⚠️ Confirm Database Re-seed:\nAre you sure you want to clear and re-seed the CognoDB Cloud graph database with synthetic demo data?'
    );
    if (!confirmed) return;

    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMessage('✓ Database graph successfully re-seeded!');
        onRefreshHealth();
      } else {
        setSeedMessage(`❌ ${data.message}`);
      }
    } catch (e: any) {
      setSeedMessage(`❌ Seed error: ${e.message}`);
    } finally {
      setSeeding(false);
      setShowDevMenu(false);
      setTimeout(() => setSeedMessage(null), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Network className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">NexusGraph</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Wexa AI Assessment
              </span>
            </div>
            <p className="text-xs text-slate-400">Software Supply Chain & Vulnerability Intelligence</p>
          </div>
        </div>

        {/* Action Controls & Badge */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <StatusBadge status={healthStatus} loading={healthLoading} onRefresh={onRefreshHealth} />

          <div className="flex items-center gap-2 relative">
            {/* Developer Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDevMenu(!showDevMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-all"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                Dev Tools
              </button>

              {showDevMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800 mb-1">
                    Database Controls
                  </div>
                  <button
                    onClick={handleSeed}
                    disabled={seeding || healthStatus?.status !== 'connected'}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-slate-200 hover:bg-rose-950/40 hover:text-rose-300 transition-colors disabled:opacity-40"
                  >
                    <Database className={`w-3.5 h-3.5 text-rose-400 ${seeding ? 'animate-spin' : ''}`} />
                    {seeding ? 'Seeding Database...' : 'Re-seed Graph Database'}
                  </button>
                  {healthStatus?.status !== 'connected' && (
                    <p className="px-2.5 py-1 text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Live CognoDB instance required
                    </p>
                  )}
                </div>
              )}
            </div>

            <a
              href="https://github.com/dattu-codes/CognoDB_database_layer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Repository
            </a>
          </div>
        </div>
      </div>

      {seedMessage && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 rounded text-xs bg-slate-900 border border-slate-700 text-slate-300">
          {seedMessage}
        </div>
      )}
    </header>
  );
};
