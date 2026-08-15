'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MetricCards } from '@/components/MetricCards';
import { VulnerabilitySelector } from '@/components/VulnerabilitySelector';
import { BlastRadiusPanel } from '@/components/BlastRadiusPanel';
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { DependencyTable } from '@/components/DependencyTable';
import { RiskDependencies } from '@/components/RiskDependencies';
import { NodeInspector } from '@/components/NodeInspector';
import {
  HealthStatus,
  SystemOverview,
  Vulnerability,
  BlastRadiusResult,
  DependencyPathResult,
  RiskDependencyItem,
  GraphNode,
} from '@/lib/types';
import { MOCK_SERVICES, MOCK_PACKAGES } from '@/lib/mockData';

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedCve, setSelectedCve] = useState<string>('CVE-2021-44228');

  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [blastLoading, setBlastLoading] = useState(true);

  const [pathResult, setPathResult] = useState<DependencyPathResult | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  const [riskDependencies, setRiskDependencies] = useState<RiskDependencyItem[]>([]);
  const [riskLoading, setRiskLoading] = useState(true);

  const [inspectNode, setInspectNode] = useState<GraphNode | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch {
      setHealthStatus({
        status: 'demo_mode',
        message: 'Could not reach health endpoint. Running in Demo Mode.',
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchOverviewData = async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch('/api/overview');
      const data = await res.json();
      setOverview(data.overview);
    } catch (e) {
      console.error('Overview error:', e);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchVulnsData = async () => {
    try {
      const res = await fetch('/api/vulnerabilities');
      const data = await res.json();
      setVulnerabilities(data.vulnerabilities || []);
    } catch (e) {
      console.error('Vuln list error:', e);
    }
  };

  const fetchBlastRadiusData = async (cveId: string) => {
    setBlastLoading(true);
    try {
      const res = await fetch(`/api/blast-radius?cve=${encodeURIComponent(cveId)}`);
      const data = await res.json();
      setBlastRadius(data);
    } catch (e) {
      console.error('Blast radius error:', e);
    } finally {
      setBlastLoading(false);
    }
  };

  const fetchDependencyPathData = async (serviceName: string, packageName: string) => {
    setPathLoading(true);
    try {
      const res = await fetch(
        `/api/dependency-path?service=${encodeURIComponent(serviceName)}&package=${encodeURIComponent(packageName)}`
      );
      const data = await res.json();
      setPathResult(data);
    } catch (e) {
      console.error('Dependency path error:', e);
    } finally {
      setPathLoading(false);
    }
  };

  const fetchRiskData = async () => {
    setRiskLoading(true);
    try {
      const res = await fetch('/api/risk-dependencies');
      const data = await res.json();
      setRiskDependencies(data.riskDependencies || []);
    } catch (e) {
      console.error('Risk error:', e);
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchOverviewData();
    fetchVulnsData();
    fetchRiskData();
    fetchDependencyPathData('payment-service', 'log4j-core');
  }, []);

  useEffect(() => {
    if (selectedCve) {
      fetchBlastRadiusData(selectedCve);
    }
  }, [selectedCve]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header healthStatus={healthStatus} healthLoading={healthLoading} onRefreshHealth={fetchHealth} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Metric Cards */}
        <MetricCards overview={overview} loading={overviewLoading} />

        {/* Vulnerability Selector Controls */}
        <VulnerabilitySelector
          vulnerabilities={vulnerabilities}
          selectedCve={selectedCve}
          onSelectCve={setSelectedCve}
          loading={blastLoading}
        />

        {/* Primary Investigation Panel: Blast Radius */}
        <BlastRadiusPanel
          blastRadius={blastRadius}
          loading={blastLoading}
          onSelectNode={(nodeId) => {
            if (blastRadius?.graph?.nodes) {
              const node = blastRadius.graph.nodes.find((n) => n.id === nodeId);
              if (node) setInspectNode(node);
            }
          }}
        />

        {/* Focused Subgraph Visualization Canvas */}
        <GraphVisualizer
          graphData={blastRadius?.graph || null}
          onSelectNode={(node) => setInspectNode(node)}
          loading={blastLoading}
          highlightCveId={selectedCve}
        />

        {/* Secondary Workflow: Dependency Path Explorer */}
        <DependencyTable
          services={MOCK_SERVICES}
          packages={MOCK_PACKAGES}
          pathResult={pathResult}
          onSearchPath={fetchDependencyPathData}
          loading={pathLoading}
        />

        {/* Risk Dependencies Table */}
        <RiskDependencies riskDependencies={riskDependencies} loading={riskLoading} />
      </main>

      {/* Slide-over Node Inspector */}
      <NodeInspector node={inspectNode} onClose={() => setInspectNode(null)} />

      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        NexusGraph — Powered by CognoDB Cloud & openCypher over Bolt. Wexa AI Engineering Assessment.
      </footer>
    </div>
  );
}
