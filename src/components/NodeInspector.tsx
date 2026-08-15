'use client';

import React from 'react';
import { GraphNode } from '@/lib/types';
import { X, Server, Package, ShieldAlert, Users, GitBranch, Globe, Info, ExternalLink, CheckCircle } from 'lucide-react';

interface NodeInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose }) => {
  if (!node) return null;

  const props = node.properties || {};

  const getIcon = (label: string) => {
    switch (label) {
      case 'Service':
        return <Server className="w-5 h-5 text-sky-400" />;
      case 'Package':
        return <Package className="w-5 h-5 text-emerald-400" />;
      case 'Vulnerability':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Maintainer':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'Repository':
        return <GitBranch className="w-5 h-5 text-amber-400" />;
      case 'Environment':
        return <Globe className="w-5 h-5 text-indigo-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBadgeClass = (label: string) => {
    switch (label) {
      case 'Service':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Package':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Vulnerability':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Maintainer':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Repository':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Environment':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{getIcon(node.label)}</div>
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getBadgeClass(node.label)}`}>
                {node.label}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">{node.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Attributes Grid */}
        <div className="mt-5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Node Properties</h4>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
            {Object.entries(props).map(([key, value]) => {
              if (key === 'id') return null;
              return (
                <div key={key} className="flex items-start justify-between text-xs py-1 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-400 capitalize font-medium">{key}:</span>
                  <span className="text-slate-200 font-mono font-semibold max-w-[200px] truncate text-right">
                    {typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Node Specific Helper Details */}
          {node.label === 'Package' && (
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
              <span className="font-semibold block mb-1">Ecosystem & Licensing</span>
              <p className="text-[11px] text-emerald-400/90">
                Ecosystem: <span className="font-mono uppercase">{props.ecosystem || 'npm'}</span> • License: <span className="font-mono">{props.license || 'Apache-2.0'}</span>
              </p>
            </div>
          )}

          {node.label === 'Service' && (
            <div className="p-3 bg-sky-950/40 rounded-xl border border-sky-500/20 text-xs text-sky-300">
              <span className="font-semibold block mb-1">Microservice Ownership</span>
              <p className="text-[11px] text-sky-400/90">
                Tier: <span className="font-semibold uppercase">{props.tier || 'critical'}</span> • Owner: {props.owner || 'Engineering Team'}
              </p>
            </div>
          )}

          {node.label === 'Vulnerability' && (
            <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/20 text-xs text-rose-300">
              <span className="font-semibold block mb-1">CVSS Vulnerability Rating</span>
              <p className="text-[11px] text-rose-400/90">
                Score {props.cvssScore || 10.0} / 10.0 ({props.severity || 'CRITICAL'})
              </p>
            </div>
          )}

          {node.label === 'Maintainer' && (
            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/20 text-xs text-purple-300">
              <span className="font-semibold block mb-1 flex items-center gap-1">
                Maintainer Identity
                {props.verified && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
              </span>
              <p className="text-[11px] text-purple-400/90 font-mono">
                {props.email || 'security@maintainer.org'}
              </p>
            </div>
          )}

          {node.label === 'Repository' && (
            <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/20 text-xs text-amber-300">
              <span className="font-semibold block mb-1">Source Repository</span>
              <a
                href={props.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-mono truncate"
              >
                {props.url || 'https://github.com/wexa-ai/monorepo'}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {node.label === 'Environment' && (
            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-300">
              <span className="font-semibold block mb-1">Deployment Region</span>
              <p className="text-[11px] text-indigo-400/90 font-mono">
                Region: {props.region || 'us-east-1'} ({props.type || 'production'})
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors mt-4"
      >
        Close Inspector
      </button>
    </div>
  );
};
