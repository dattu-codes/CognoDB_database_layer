import { executeCypher } from './cognodb';
import {
  getMockBlastRadius,
  getMockDependencyPath,
  getMockRiskDependencies,
  getMockOverview,
  getMockGraphData,
  MOCK_VULNERABILITIES
} from './mockData';
import {
  BlastRadiusResult,
  DependencyPathResult,
  RiskDependencyItem,
  SystemOverview,
  GraphData,
  Vulnerability,
  Severity
} from './types';

// Centralized Parameterized Cypher Queries for NexusGraph

export async function fetchVulnerabilityList(): Promise<{ vulnerabilities: Vulnerability[]; isConnected: boolean }> {
  const query = `
    MATCH (v:Vulnerability)
    OPTIONAL MATCH (p:Package)-[:HAS_VULNERABILITY]->(v)
    RETURN v.id AS id, v.cveId AS cveId, v.severity AS severity, v.cvssScore AS cvssScore, v.summary AS summary, count(p) AS packageCount
    ORDER BY v.cvssScore DESC
  `;

  const { records, isConnected } = await executeCypher(query);

  if (isConnected && records.length > 0) {
    const vulnerabilities: Vulnerability[] = records.map((r: any) => ({
      id: r.id || r.cveId,
      cveId: r.cveId,
      severity: (r.severity || 'HIGH') as Severity,
      cvssScore: Number(r.cvssScore) || 7.5,
      summary: r.summary || `Vulnerability ${r.cveId}`
    }));
    return { vulnerabilities, isConnected: true };
  }

  return { vulnerabilities: MOCK_VULNERABILITIES, isConnected: false };
}

export async function fetchBlastRadius(cveId: string): Promise<{ result: BlastRadiusResult; isConnected: boolean }> {
  const query = `
    MATCH path = (s:Service)-[:DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability {cveId: $cveId})
    OPTIONAL MATCH (s)-[:DEPLOYED_IN]->(e:Environment)
    RETURN 
      s.id AS serviceId,
      s.name AS serviceName,
      s.tier AS tier,
      coalesce(e.name, 'production-us-east') AS environment,
      coalesce(e.type, 'production') AS envType,
      p.name AS vulnerablePackage,
      p.version AS version,
      v.cveId AS cveId,
      v.summary AS summary,
      v.severity AS severity,
      v.cvssScore AS cvssScore,
      [node IN nodes(path) | {
        id: coalesce(node.id, node.name, node.cveId),
        label: labels(node)[0],
        name: coalesce(node.name, node.cveId)
      }] AS pathNodes,
      length(path) - 1 AS hopDistance
    ORDER BY hopDistance ASC, s.tier DESC
  `;

  const { records, isConnected } = await executeCypher(query, { cveId });

  if (isConnected && records.length > 0) {
    const first = records[0];
    let prodCount = 0;
    let stagingCount = 0;

    const affectedServices = records.map((r: any) => {
      const isProd = (r.envType || r.environment).includes('prod');
      if (isProd) prodCount++;
      else stagingCount++;

      return {
        serviceId: r.serviceId,
        serviceName: r.serviceName,
        tier: r.tier || 'critical',
        environment: r.environment,
        vulnerablePackage: r.vulnerablePackage,
        version: r.version,
        cveId: r.cveId,
        severity: (r.severity || 'CRITICAL') as Severity,
        cvssScore: Number(r.cvssScore) || 9.0,
        pathNodes: r.pathNodes || [],
        hopDistance: Number(r.hopDistance) || 2
      };
    });

    const maxHopDepth = Math.max(...affectedServices.map(s => s.hopDistance), 0);

    const result: BlastRadiusResult = {
      cveId,
      vulnerabilitySummary: first.summary || `Security vulnerability ${cveId}`,
      cvssScore: Number(first.cvssScore) || 9.0,
      severity: (first.severity || 'CRITICAL') as Severity,
      vulnerablePackage: first.vulnerablePackage,
      vulnerableVersion: first.version,
      affectedServicesCount: affectedServices.length,
      prodServicesCount: prodCount,
      stagingServicesCount: stagingCount,
      maxHopDepth,
      affectedServices,
      graph: await fetchFullGraph().then(res => res.graph)
    };

    return { result, isConnected: true };
  }

  return { result: getMockBlastRadius(cveId), isConnected: false };
}

export async function fetchDependencyPath(
  serviceName: string,
  packageName: string
): Promise<{ result: DependencyPathResult; isConnected: boolean }> {
  const query = `
    MATCH (s:Service {name: $serviceName}), (p:Package {name: $packageName})
    MATCH path = shortestPath((s)-[:DEPENDS_ON*1..10]->(p))
    OPTIONAL MATCH (p)-[:HAS_VULNERABILITY]->(v:Vulnerability)
    RETURN 
      s.name AS serviceName,
      p.name AS packageName,
      [node IN nodes(path) | {
        id: coalesce(node.id, node.name),
        label: labels(node)[0],
        name: coalesce(node.name, node.cveId),
        version: node.version
      }] AS pathNodes,
      length(path) AS hopDistance,
      collect(DISTINCT { cveId: v.cveId, severity: v.severity, cvssScore: v.cvssScore }) AS vulns
  `;

  const { records, isConnected } = await executeCypher(query, { serviceName, packageName });

  if (isConnected && records.length > 0) {
    const r = records[0];
    const vulnerabilities = (r.vulns || []).filter((v: any) => v.cveId);

    const result: DependencyPathResult = {
      serviceName: r.serviceName,
      packageName: r.packageName,
      pathNodes: r.pathNodes || [],
      hopDistance: Number(r.hopDistance) || 1,
      targetHasVulnerabilities: vulnerabilities.length > 0,
      vulnerabilities,
      graph: await fetchFullGraph().then(res => res.graph)
    };

    return { result, isConnected: true };
  }

  return { result: getMockDependencyPath(serviceName, packageName), isConnected: false };
}

export async function fetchRiskDependencies(): Promise<{ riskDependencies: RiskDependencyItem[]; isConnected: boolean }> {
  const query = `
    MATCH (s:Service)-[:DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
    WHERE v.severity IN ['CRITICAL', 'HIGH']
    OPTIONAL MATCH (s)-[:DEPLOYED_IN]->(e:Environment)
    WITH p, v, s, e
    WITH p, v,
         count(DISTINCT s) AS affectedServicesCount,
         count(DISTINCT CASE WHEN e.type = 'production' OR e.name CONTAINS 'prod' THEN s END) AS prodServicesCount
    RETURN 
      p.name AS packageName,
      p.version AS version,
      p.ecosystem AS ecosystem,
      v.cveId AS cveId,
      v.severity AS severity,
      v.cvssScore AS cvssScore,
      affectedServicesCount,
      prodServicesCount
    ORDER BY prodServicesCount DESC, affectedServicesCount DESC
    LIMIT 10
  `;

  const { records, isConnected } = await executeCypher(query);

  if (isConnected && records.length > 0) {
    const riskDependencies: RiskDependencyItem[] = records.map((r: any) => ({
      packageName: r.packageName,
      version: r.version,
      ecosystem: r.ecosystem || 'npm',
      cveId: r.cveId,
      severity: (r.severity || 'HIGH') as Severity,
      cvssScore: Number(r.cvssScore) || 8.0,
      affectedServicesCount: Number(r.affectedServicesCount) || 1,
      prodServicesCount: Number(r.prodServicesCount) || 1,
      maxDepth: 3
    }));

    return { riskDependencies, isConnected: true };
  }

  return { riskDependencies: getMockRiskDependencies(), isConnected: false };
}

export async function fetchOverview(): Promise<{ overview: SystemOverview; isConnected: boolean }> {
  const query = `
    OPTIONAL MATCH (s:Service) WITH count(s) AS totalServices
    OPTIONAL MATCH (p:Package) WITH totalServices, count(p) AS totalPackages
    OPTIONAL MATCH (v:Vulnerability) WITH totalServices, totalPackages, count(v) AS totalVulnerabilities
    OPTIONAL MATCH (m:Maintainer) WITH totalServices, totalPackages, totalVulnerabilities, count(m) AS totalMaintainers
    OPTIONAL MATCH (r:Repository) WITH totalServices, totalPackages, totalVulnerabilities, totalMaintainers, count(r) AS totalRepositories
    OPTIONAL MATCH (e:Environment) WITH totalServices, totalPackages, totalVulnerabilities, totalMaintainers, totalRepositories, count(e) AS totalEnvironments
    OPTIONAL MATCH ()-[d:DEPENDS_ON]->() WITH totalServices, totalPackages, totalVulnerabilities, totalMaintainers, totalRepositories, totalEnvironments, count(d) AS totalDependencies
    OPTIONAL MATCH (vc:Vulnerability) WHERE vc.severity = 'CRITICAL'
    RETURN 
      totalServices,
      totalPackages,
      totalVulnerabilities,
      totalMaintainers,
      totalRepositories,
      totalEnvironments,
      totalDependencies,
      count(vc) AS criticalVulnerabilitiesCount
  `;

  const { records, isConnected } = await executeCypher(query);

  if (isConnected && records.length > 0) {
    const r = records[0];
    const overview: SystemOverview = {
      totalServices: Number(r.totalServices) || 0,
      totalPackages: Number(r.totalPackages) || 0,
      totalVulnerabilities: Number(r.totalVulnerabilities) || 0,
      totalMaintainers: Number(r.totalMaintainers) || 0,
      totalRepositories: Number(r.totalRepositories) || 0,
      totalEnvironments: Number(r.totalEnvironments) || 0,
      totalDependencies: Number(r.totalDependencies) || 0,
      criticalVulnerabilitiesCount: Number(r.criticalVulnerabilitiesCount) || 0,
      highRiskPackagesCount: 4
    };
    return { overview, isConnected: true };
  }

  return { overview: getMockOverview(), isConnected: false };
}

export async function fetchFullGraph(): Promise<{ graph: GraphData; isConnected: boolean }> {
  const query = `
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m
    LIMIT 300
  `;

  const { records, isConnected } = await executeCypher(query);

  if (isConnected && records.length > 0) {
    const nodeMap = new Map<string, any>();
    const relMap = new Map<string, any>();

    records.forEach((rec: any) => {
      if (rec.n && rec.n.id) {
        nodeMap.set(rec.n.id, {
          id: rec.n.id,
          label: rec.n.label || 'Node',
          name: rec.n.properties?.name || rec.n.properties?.cveId || rec.n.id,
          properties: rec.n.properties || {}
        });
      }
      if (rec.m && rec.m.id) {
        nodeMap.set(rec.m.id, {
          id: rec.m.id,
          label: rec.m.label || 'Node',
          name: rec.m.properties?.name || rec.m.properties?.cveId || rec.m.id,
          properties: rec.m.properties || {}
        });
      }
      if (rec.r && rec.n && rec.m) {
        const relKey = `${rec.n.id}-${rec.r.type}-${rec.m.id}`;
        relMap.set(relKey, {
          id: relKey,
          type: rec.r.type,
          source: rec.n.id,
          target: rec.m.id,
          properties: rec.r.properties || {}
        });
      }
    });

    const graph: GraphData = {
      nodes: Array.from(nodeMap.values()),
      relationships: Array.from(relMap.values())
    };

    return { graph, isConnected: true };
  }

  return { graph: getMockGraphData(), isConnected: false };
}
