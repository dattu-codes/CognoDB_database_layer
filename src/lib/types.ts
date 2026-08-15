export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ServiceTier = 'critical' | 'high' | 'medium' | 'low';
export type EnvironmentType = 'production' | 'staging' | 'development';
export type Ecosystem = 'npm' | 'pypi' | 'maven' | 'crates';

export interface Service {
  id: string;
  name: string;
  tier: ServiceTier;
  owner: string;
  criticality: number;
}

export interface Package {
  id: string;
  name: string;
  version: string;
  ecosystem: Ecosystem;
  license: string;
}

export interface Vulnerability {
  id: string;
  cveId: string;
  severity: Severity;
  cvssScore: number;
  summary: string;
}

export interface Maintainer {
  id: string;
  handle: string;
  email: string;
  verified: boolean;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  defaultBranch: string;
}

export interface Environment {
  id: string;
  name: string;
  region: string;
  type: EnvironmentType;
}

export interface GraphNode {
  id: string;
  label: 'Service' | 'Package' | 'Vulnerability' | 'Maintainer' | 'Repository' | 'Environment';
  name: string;
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: 'BUILDS' | 'DEPENDS_ON' | 'HAS_VULNERABILITY' | 'MAINTAINED_BY' | 'DEPLOYED_IN';
  source: string;
  target: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface BlastRadiusPathNode {
  id: string;
  label: string;
  name: string;
  type?: string;
}

export interface BlastRadiusItem {
  serviceId: string;
  serviceName: string;
  tier: ServiceTier;
  environment: string;
  vulnerablePackage: string;
  version: string;
  cveId: string;
  severity: Severity;
  cvssScore: number;
  pathNodes: BlastRadiusPathNode[];
  hopDistance: number;
}

export interface BlastRadiusResult {
  cveId: string;
  vulnerabilitySummary: string;
  cvssScore: number;
  severity: Severity;
  vulnerablePackage: string;
  vulnerableVersion: string;
  affectedServicesCount: number;
  prodServicesCount: number;
  stagingServicesCount: number;
  maxHopDepth: number;
  affectedServices: BlastRadiusItem[];
  graph: GraphData;
}

export interface DependencyPathResult {
  serviceName: string;
  packageName: string;
  pathNodes: { id: string; label: string; name: string; version?: string }[];
  hopDistance: number;
  targetHasVulnerabilities: boolean;
  vulnerabilities?: { cveId: string; severity: Severity; cvssScore: number }[];
  graph: GraphData;
}

export interface RiskDependencyItem {
  packageName: string;
  version: string;
  ecosystem: string;
  cveId: string;
  severity: Severity;
  cvssScore: number;
  affectedServicesCount: number;
  prodServicesCount: number;
  maxDepth: number;
}

export interface SystemOverview {
  totalServices: number;
  totalPackages: number;
  totalVulnerabilities: number;
  totalMaintainers: number;
  totalRepositories: number;
  totalEnvironments: number;
  totalDependencies: number;
  criticalVulnerabilitiesCount: number;
  highRiskPackagesCount: number;
}

export interface HealthStatus {
  status: 'connected' | 'demo_mode' | 'error';
  message: string;
  uri?: string;
  database?: string;
  nodeCount?: number;
  relationshipCount?: number;
}
