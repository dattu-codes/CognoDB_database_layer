import {
  Service,
  Package,
  Vulnerability,
  Maintainer,
  Repository,
  Environment,
  GraphNode,
  GraphRelationship,
  GraphData,
  BlastRadiusResult,
  DependencyPathResult,
  RiskDependencyItem,
  SystemOverview
} from './types';

// Synthetic Demonstration Dataset Disclaimer:
// This dataset is synthetically generated for demonstration and evaluation of graph algorithms in NexusGraph.

export const MOCK_SERVICES: Service[] = [
  { id: 'srv-payment', name: 'payment-service', tier: 'critical', owner: 'Payments Platform Team', criticality: 5 },
  { id: 'srv-checkout', name: 'checkout-service', tier: 'critical', owner: 'E-Commerce Core Team', criticality: 5 },
  { id: 'srv-identity', name: 'identity-service', tier: 'critical', owner: 'Security & Auth Team', criticality: 5 },
  { id: 'srv-catalog', name: 'catalog-service', tier: 'high', owner: 'Product Content Team', criticality: 4 },
  { id: 'srv-order', name: 'order-service', tier: 'critical', owner: 'Fulfillment Team', criticality: 5 },
  { id: 'srv-notification', name: 'notification-service', tier: 'medium', owner: 'Communications Team', criticality: 3 },
  { id: 'srv-analytics', name: 'analytics-service', tier: 'medium', owner: 'Data Engineering Team', criticality: 2 },
  { id: 'srv-recommendation', name: 'recommendation-service', tier: 'high', owner: 'ML Intelligence Team', criticality: 3 },
  { id: 'srv-inventory', name: 'inventory-service', tier: 'high', owner: 'Warehouse Logistics Team', criticality: 4 },
  { id: 'srv-gateway', name: 'gateway-service', tier: 'critical', owner: 'Infrastructure Engineering', criticality: 5 },
];

export const MOCK_ENVIRONMENTS: Environment[] = [
  { id: 'env-prod-us-east', name: 'production-us-east', region: 'us-east-1', type: 'production' },
  { id: 'env-prod-eu-west', name: 'production-eu-west', region: 'eu-west-1', type: 'production' },
  { id: 'env-staging', name: 'staging-global', region: 'us-west-2', type: 'staging' },
  { id: 'env-dev', name: 'development-sandbox', region: 'us-east-1', type: 'development' },
];

export const MOCK_REPOSITORIES: Repository[] = [
  { id: 'repo-checkout', name: 'demo-org/checkout-monorepo', url: 'https://github.com/demo-org/checkout-monorepo', defaultBranch: 'main' },
  { id: 'repo-payment', name: 'demo-org/payment-gateway', url: 'https://github.com/demo-org/payment-gateway', defaultBranch: 'main' },
  { id: 'repo-auth', name: 'demo-org/identity-provider', url: 'https://github.com/demo-org/identity-provider', defaultBranch: 'main' },
  { id: 'repo-analytics', name: 'demo-org/analytics-pipeline', url: 'https://github.com/demo-org/analytics-pipeline', defaultBranch: 'main' },
  { id: 'repo-infra', name: 'demo-org/core-gateway', url: 'https://github.com/demo-org/core-gateway', defaultBranch: 'main' },
];

export const MOCK_MAINTAINERS: Maintainer[] = [
  { id: 'maint-apache', handle: 'apache-security', email: 'security@apache.org', verified: true },
  { id: 'maint-log4j-lead', handle: 'rgoers', email: 'rgoers@apache.org', verified: true },
  { id: 'maint-express', handle: 'tjholowaychuk', email: 'tj@expressjs.org', verified: true },
  { id: 'maint-jackson', handle: 'cowtowncoder', email: 'tatu@fasterxml.com', verified: true },
  { id: 'maint-xz', handle: 'security-maintainer-demo', email: 'maintainer@example.invalid', verified: false },
  { id: 'maint-axios', handle: 'mzabriskie', email: 'matt@axios.org', verified: true },
  { id: 'maint-commons', handle: 'ggregory', email: 'ggregory@apache.org', verified: true },
];

export const MOCK_PACKAGES: Package[] = [
  { id: 'pkg-log4j-core', name: 'log4j-core', version: '2.14.1', ecosystem: 'maven', license: 'Apache-2.0' },
  { id: 'pkg-log4j-api', name: 'log4j-api', version: '2.14.1', ecosystem: 'maven', license: 'Apache-2.0' },
  { id: 'pkg-jackson-databind', name: 'jackson-databind', version: '2.12.3', ecosystem: 'maven', license: 'Apache-2.0' },
  { id: 'pkg-commons-text', name: 'commons-text', version: '1.9', ecosystem: 'maven', license: 'Apache-2.0' },
  { id: 'pkg-spring-core', name: 'spring-core', version: '5.3.9', ecosystem: 'maven', license: 'Apache-2.0' },
  { id: 'pkg-xz-utils', name: 'xz-utils', version: '5.6.0', ecosystem: 'system', license: 'GPL-2.0' },
  { id: 'pkg-net-helper', name: 'net-helper-lib', version: '1.0.4', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-express', name: 'express', version: '4.17.1', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-jsonwebtoken', name: 'jsonwebtoken', version: '8.5.1', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-axios', name: 'axios', version: '0.21.1', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-lodash', name: 'lodash', version: '4.17.20', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-async-util', name: 'async-util-core', version: '2.0.1', ecosystem: 'npm', license: 'MIT' },
  { id: 'pkg-crypto-provider', name: 'crypto-provider-sdk', version: '1.2.0', ecosystem: 'pypi', license: 'BSD-3-Clause' },
  { id: 'pkg-protobuf', name: 'protobuf-java', version: '3.15.8', ecosystem: 'maven', license: 'BSD-3-Clause' },
  { id: 'pkg-grpc-core', name: 'grpc-core', version: '1.38.0', ecosystem: 'maven', license: 'Apache-2.0' },
];

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'vuln-cve-2021-44228',
    cveId: 'CVE-2021-44228',
    severity: 'CRITICAL',
    cvssScore: 10.0,
    summary: 'Apache Log4j2 Remote Code Execution (Log4Shell) via JNDI lookup handling.'
  },
  {
    id: 'vuln-cve-2024-3094',
    cveId: 'CVE-2024-3094',
    severity: 'CRITICAL',
    cvssScore: 10.0,
    summary: 'Malicious backdoor injected in XZ Utils payload extraction during build process.'
  },
  {
    id: 'vuln-cve-2022-42889',
    cveId: 'CVE-2022-42889',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    summary: 'Apache Commons Text Remote Code Execution (Text4Shell) via string interpolation.'
  },
  {
    id: 'vuln-cve-2023-44487',
    cveId: 'CVE-2023-44487',
    severity: 'HIGH',
    cvssScore: 7.5,
    summary: 'HTTP/2 Rapid Reset Attack enabling Denial of Service across web proxies.'
  },
  {
    id: 'vuln-cve-2020-8203',
    cveId: 'CVE-2020-8203',
    severity: 'HIGH',
    cvssScore: 7.4,
    summary: 'Prototype Pollution vulnerability in Lodash zipObjectDeep utility.'
  },
  {
    id: 'vuln-cve-2023-26159',
    cveId: 'CVE-2023-26159',
    severity: 'MEDIUM',
    cvssScore: 6.1,
    summary: 'Follow-redirects memory exposure issue in Axios HTTP requests.'
  }
];

export function getMockGraphData(): GraphData {
  const nodes: GraphNode[] = [
    ...MOCK_SERVICES.map(s => ({ id: s.id, label: 'Service' as const, name: s.name, properties: s })),
    ...MOCK_PACKAGES.map(p => ({ id: p.id, label: 'Package' as const, name: `${p.name}@${p.version}`, properties: p })),
    ...MOCK_VULNERABILITIES.map(v => ({ id: v.id, label: 'Vulnerability' as const, name: v.cveId, properties: v })),
    ...MOCK_MAINTAINERS.map(m => ({ id: m.id, label: 'Maintainer' as const, name: m.handle, properties: m })),
    ...MOCK_REPOSITORIES.map(r => ({ id: r.id, label: 'Repository' as const, name: r.name, properties: r })),
    ...MOCK_ENVIRONMENTS.map(e => ({ id: e.id, label: 'Environment' as const, name: e.name, properties: e })),
  ];

  const relationships: GraphRelationship[] = [
    // Service DEPLOYED_IN Environment
    { id: 'rel-1', type: 'DEPLOYED_IN', source: 'srv-payment', target: 'env-prod-us-east' },
    { id: 'rel-2', type: 'DEPLOYED_IN', source: 'srv-payment', target: 'env-prod-eu-west' },
    { id: 'rel-3', type: 'DEPLOYED_IN', source: 'srv-checkout', target: 'env-prod-us-east' },
    { id: 'rel-4', type: 'DEPLOYED_IN', source: 'srv-identity', target: 'env-prod-us-east' },
    { id: 'rel-5', type: 'DEPLOYED_IN', source: 'srv-catalog', target: 'env-staging' },
    { id: 'rel-6', type: 'DEPLOYED_IN', source: 'srv-order', target: 'env-prod-us-east' },
    { id: 'rel-7', type: 'DEPLOYED_IN', source: 'srv-gateway', target: 'env-prod-us-east' },

    // Repository BUILDS Service
    { id: 'rel-8', type: 'BUILDS', source: 'repo-checkout', target: 'srv-checkout' },
    { id: 'rel-9', type: 'BUILDS', source: 'repo-payment', target: 'srv-payment' },
    { id: 'rel-10', type: 'BUILDS', source: 'repo-auth', target: 'srv-identity' },
    { id: 'rel-11', type: 'BUILDS', source: 'repo-infra', target: 'srv-gateway' },

    // Service DEPENDS_ON Package (Direct Dependencies)
    { id: 'rel-12', type: 'DEPENDS_ON', source: 'srv-checkout', target: 'pkg-express' },
    { id: 'rel-13', type: 'DEPENDS_ON', source: 'srv-checkout', target: 'pkg-spring-core' },
    { id: 'rel-14', type: 'DEPENDS_ON', source: 'srv-payment', target: 'pkg-crypto-provider' },
    { id: 'rel-15', type: 'DEPENDS_ON', source: 'srv-payment', target: 'pkg-jackson-databind' },
    { id: 'rel-16', type: 'DEPENDS_ON', source: 'srv-identity', target: 'pkg-jsonwebtoken' },
    { id: 'rel-17', type: 'DEPENDS_ON', source: 'srv-gateway', target: 'pkg-net-helper' },
    { id: 'rel-18', type: 'DEPENDS_ON', source: 'srv-order', target: 'pkg-spring-core' },

    // Package DEPENDS_ON Package (Transitive Dependencies - 2 to 4 hops)
    { id: 'rel-19', type: 'DEPENDS_ON', source: 'pkg-spring-core', target: 'pkg-log4j-core' },
    { id: 'rel-20', type: 'DEPENDS_ON', source: 'pkg-log4j-core', target: 'pkg-log4j-api' },
    { id: 'rel-21', type: 'DEPENDS_ON', source: 'pkg-express', target: 'pkg-axios' },
    { id: 'rel-22', type: 'DEPENDS_ON', source: 'pkg-net-helper', target: 'pkg-xz-utils' },
    { id: 'rel-23', type: 'DEPENDS_ON', source: 'pkg-jackson-databind', target: 'pkg-commons-text' },
    { id: 'rel-24', type: 'DEPENDS_ON', source: 'pkg-crypto-provider', target: 'pkg-async-util' },
    { id: 'rel-25', type: 'DEPENDS_ON', source: 'pkg-async-util', target: 'pkg-log4j-core' },

    // Package HAS_VULNERABILITY Vulnerability
    { id: 'rel-26', type: 'HAS_VULNERABILITY', source: 'pkg-log4j-core', target: 'vuln-cve-2021-44228' },
    { id: 'rel-27', type: 'HAS_VULNERABILITY', source: 'pkg-xz-utils', target: 'vuln-cve-2024-3094' },
    { id: 'rel-28', type: 'HAS_VULNERABILITY', source: 'pkg-commons-text', target: 'vuln-cve-2022-42889' },
    { id: 'rel-29', type: 'HAS_VULNERABILITY', source: 'pkg-axios', target: 'vuln-cve-2023-26159' },
    { id: 'rel-30', type: 'HAS_VULNERABILITY', source: 'pkg-lodash', target: 'vuln-cve-2020-8203' },

    // Package MAINTAINED_BY Maintainer
    { id: 'rel-31', type: 'MAINTAINED_BY', source: 'pkg-log4j-core', target: 'maint-log4j-lead' },
    { id: 'rel-32', type: 'MAINTAINED_BY', source: 'pkg-xz-utils', target: 'maint-xz' },
    { id: 'rel-33', type: 'MAINTAINED_BY', source: 'pkg-express', target: 'maint-express' },
    { id: 'rel-34', type: 'MAINTAINED_BY', source: 'pkg-commons-text', target: 'maint-commons' },
  ];

  return { nodes, relationships };
}

export function getMockBlastRadius(cveId: string): BlastRadiusResult {
  const cve = MOCK_VULNERABILITIES.find(v => v.cveId.toLowerCase() === cveId.toLowerCase()) || MOCK_VULNERABILITIES[0];
  
  if (cve.cveId === 'CVE-2021-44228') {
    return {
      cveId: 'CVE-2021-44228',
      vulnerabilitySummary: 'Apache Log4j2 Remote Code Execution (Log4Shell) via JNDI lookup handling.',
      cvssScore: 10.0,
      severity: 'CRITICAL',
      vulnerablePackage: 'log4j-core',
      vulnerableVersion: '2.14.1',
      affectedServicesCount: 3,
      prodServicesCount: 3,
      stagingServicesCount: 1,
      maxHopDepth: 3,
      affectedServices: [
        {
          serviceId: 'srv-checkout',
          serviceName: 'checkout-service',
          tier: 'critical',
          environment: 'production-us-east',
          vulnerablePackage: 'log4j-core',
          version: '2.14.1',
          cveId: 'CVE-2021-44228',
          severity: 'CRITICAL',
          cvssScore: 10.0,
          hopDistance: 2,
          pathNodes: [
            { id: 'srv-checkout', label: 'Service', name: 'checkout-service' },
            { id: 'pkg-spring-core', label: 'Package', name: 'spring-core@5.3.9' },
            { id: 'pkg-log4j-core', label: 'Package', name: 'log4j-core@2.14.1' },
            { id: 'vuln-cve-2021-44228', label: 'Vulnerability', name: 'CVE-2021-44228' }
          ]
        },
        {
          serviceId: 'srv-payment',
          serviceName: 'payment-service',
          tier: 'critical',
          environment: 'production-us-east',
          vulnerablePackage: 'log4j-core',
          version: '2.14.1',
          cveId: 'CVE-2021-44228',
          severity: 'CRITICAL',
          cvssScore: 10.0,
          hopDistance: 3,
          pathNodes: [
            { id: 'srv-payment', label: 'Service', name: 'payment-service' },
            { id: 'pkg-crypto-provider', label: 'Package', name: 'crypto-provider-sdk@1.2.0' },
            { id: 'pkg-async-util', label: 'Package', name: 'async-util-core@2.0.1' },
            { id: 'pkg-log4j-core', label: 'Package', name: 'log4j-core@2.14.1' },
            { id: 'vuln-cve-2021-44228', label: 'Vulnerability', name: 'CVE-2021-44228' }
          ]
        },
        {
          serviceId: 'srv-order',
          serviceName: 'order-service',
          tier: 'critical',
          environment: 'production-us-east',
          vulnerablePackage: 'log4j-core',
          version: '2.14.1',
          cveId: 'CVE-2021-44228',
          severity: 'CRITICAL',
          cvssScore: 10.0,
          hopDistance: 2,
          pathNodes: [
            { id: 'srv-order', label: 'Service', name: 'order-service' },
            { id: 'pkg-spring-core', label: 'Package', name: 'spring-core@5.3.9' },
            { id: 'pkg-log4j-core', label: 'Package', name: 'log4j-core@2.14.1' },
            { id: 'vuln-cve-2021-44228', label: 'Vulnerability', name: 'CVE-2021-44228' }
          ]
        }
      ],
      graph: getMockGraphData()
    };
  }

  // Fallback for other CVEs
  return {
    cveId: cve.cveId,
    vulnerabilitySummary: cve.summary,
    cvssScore: cve.cvssScore,
    severity: cve.severity,
    vulnerablePackage: 'xz-utils',
    vulnerableVersion: '5.6.0',
    affectedServicesCount: 1,
    prodServicesCount: 1,
    stagingServicesCount: 0,
    maxHopDepth: 2,
    affectedServices: [
      {
        serviceId: 'srv-gateway',
        serviceName: 'gateway-service',
        tier: 'critical',
        environment: 'production-us-east',
        vulnerablePackage: 'xz-utils',
        version: '5.6.0',
        cveId: cve.cveId,
        severity: cve.severity,
        cvssScore: cve.cvssScore,
        hopDistance: 2,
        pathNodes: [
          { id: 'srv-gateway', label: 'Service', name: 'gateway-service' },
          { id: 'pkg-net-helper', label: 'Package', name: 'net-helper-lib@1.0.4' },
          { id: 'pkg-xz-utils', label: 'Package', name: 'xz-utils@5.6.0' },
          { id: cve.id, label: 'Vulnerability', name: cve.cveId }
        ]
      }
    ],
    graph: getMockGraphData()
  };
}

export function getMockDependencyPath(serviceName: string, packageName: string): DependencyPathResult {
  return {
    serviceName: serviceName || 'payment-service',
    packageName: packageName || 'log4j-core',
    hopDistance: 3,
    targetHasVulnerabilities: true,
    vulnerabilities: [
      { cveId: 'CVE-2021-44228', severity: 'CRITICAL', cvssScore: 10.0 }
    ],
    pathNodes: [
      { id: 'srv-payment', label: 'Service', name: serviceName || 'payment-service' },
      { id: 'pkg-crypto-provider', label: 'Package', name: 'crypto-provider-sdk', version: '1.2.0' },
      { id: 'pkg-async-util', label: 'Package', name: 'async-util-core', version: '2.0.1' },
      { id: 'pkg-log4j-core', label: 'Package', name: packageName || 'log4j-core', version: '2.14.1' }
    ],
    graph: getMockGraphData()
  };
}

export function getMockRiskDependencies(): RiskDependencyItem[] {
  return [
    {
      packageName: 'log4j-core',
      version: '2.14.1',
      ecosystem: 'maven',
      cveId: 'CVE-2021-44228',
      severity: 'CRITICAL',
      cvssScore: 10.0,
      affectedServicesCount: 3,
      prodServicesCount: 3,
    },
    {
      packageName: 'xz-utils',
      version: '5.6.0',
      ecosystem: 'system',
      cveId: 'CVE-2024-3094',
      severity: 'CRITICAL',
      cvssScore: 10.0,
      affectedServicesCount: 1,
      prodServicesCount: 1,
    },
    {
      packageName: 'commons-text',
      version: '1.9',
      ecosystem: 'maven',
      cveId: 'CVE-2022-42889',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      affectedServicesCount: 1,
      prodServicesCount: 1,
    },
    {
      packageName: 'axios',
      version: '0.21.1',
      ecosystem: 'npm',
      cveId: 'CVE-2023-26159',
      severity: 'MEDIUM',
      cvssScore: 6.1,
      affectedServicesCount: 1,
      prodServicesCount: 1,
    }
  ];
}

export function getMockOverview(): SystemOverview {
  return {
    totalServices: MOCK_SERVICES.length,
    totalPackages: MOCK_PACKAGES.length,
    totalVulnerabilities: MOCK_VULNERABILITIES.length,
    totalMaintainers: MOCK_MAINTAINERS.length,
    totalRepositories: MOCK_REPOSITORIES.length,
    totalEnvironments: MOCK_ENVIRONMENTS.length,
    totalDependencies: 34,
    criticalVulnerabilitiesCount: 3,
    highRiskPackagesCount: getMockRiskDependencies().length
  };
}
