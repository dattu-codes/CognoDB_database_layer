'use client';

import React from 'react';
import { SystemOverview } from '@/lib/types';
import { Server, Package, ShieldAlert, Users, GitBranch, Layers } from 'lucide-react';

interface MetricCardsProps {
  overview: SystemOverview | null;
  loading: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ overview, loading }) => {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel p-3.5 rounded-xl animate-pulse h-20 bg-slate-900/50" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Microservices',
      value: overview.totalServices,
      icon: Server,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      sub: `${overview.totalEnvironments} Environments`,
    },
    {
      label: 'Software Packages',
      value: overview.totalPackages,
      icon: Package,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      sub: `${overview.totalDependencies} Dependencies`,
    },
    {
      label: 'CVE Vulnerabilities',
      value: overview.totalVulnerabilities,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      sub: `${overview.criticalVulnerabilitiesCount} Critical Severity`,
    },
    {
      label: 'Package Maintainers',
      value: overview.totalMaintainers,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      sub: 'Ecosystem Maintainers',
    },
    {
      label: 'Repositories',
      value: overview.totalRepositories,
      icon: GitBranch,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      sub: 'Monorepos & Gateways',
    },
    {
      label: 'High-Risk Concentrators',
      value: overview.highRiskPackagesCount,
      icon: Layers,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      sub: 'Multi-service Blast Risk',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="glass-panel glass-panel-interactive p-3.5 rounded-xl border relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{m.label}</span>
              <div className={`p-1.5 rounded-lg ${m.bgColor} border ${m.borderColor}`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white tracking-tight">{m.value}</span>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
