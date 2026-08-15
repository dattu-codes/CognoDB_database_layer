'use client';

import React from 'react';
import { HealthStatus } from '@/lib/types';
import { Database, Wifi, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: HealthStatus | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, loading }) => {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400 animate-pulse">
        <Database className="w-3.5 h-3.5 animate-spin" />
        Checking CognoDB status...
      </div>
    );
  }

  const isConnected = status?.status === 'connected';

  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
          isConnected
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/30'
            : 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-900/30'
        }`}
        title={status?.message || 'Database connection status'}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        <span className="flex items-center gap-1.5">
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {isConnected ? 'LIVE — CognoDB Cloud' : 'DEMO MODE — Cached Dataset'}
        </span>
      </div>

      {status?.nodeCount !== undefined && isConnected && (
        <span className="text-xs text-slate-400 hidden md:inline-block">
          ({status.nodeCount} nodes • {status.relationshipCount} rels)
        </span>
      )}
    </div>
  );
};
