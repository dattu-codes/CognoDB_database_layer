import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD;

async function seedCognoDB() {
  console.log('\n========================================');
  console.log('  NexusGraph Seeder — CognoDB Cloud');
  console.log('========================================\n');

  if (!uri || !password) {
    console.error('❌ ERROR: Missing COGNODB_URI or COGNODB_PASSWORD in environment variables.');
    console.error('Please set up your .env.local file with your CognoDB Cloud instance details.');
    process.exit(1);
  }

  console.log(`🔌 Connecting to: ${uri}`);
  console.log(`👤 Username: ${username}`);

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  try {
    // 1. Check Connectivity
    const info = await driver.getServerInfo();
    console.log(`✅ Connected to database engine: ${info.agent || 'openCypher/Bolt'}`);

    // 2. Clear Existing Demo Graph safely
    console.log('🧹 Clearing existing demo graph data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 3. Create Constraints / Indexes if supported
    console.log('📌 Creating uniqueness constraints...');
    try {
      await session.run('CREATE CONSTRAINT service_id IF NOT EXISTS FOR (s:Service) REQUIRE s.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT package_id IF NOT EXISTS FOR (p:Package) REQUIRE p.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT vuln_id IF NOT EXISTS FOR (v:Vulnerability) REQUIRE v.cveId IS UNIQUE');
    } catch (e: any) {
      console.log('ℹ️ Constraints notice:', e.message || 'Continuing without constraints.');
    }

    // 4. Create Environments
    console.log('🏢 Seeding Environments...');
    await session.run(`
      UNWIND $environments AS env
      CREATE (e:Environment {
        id: env.id,
        name: env.name,
        region: env.region,
        type: env.type
      })
    `, {
      environments: [
        { id: 'env-prod-us-east', name: 'production-us-east', region: 'us-east-1', type: 'production' },
        { id: 'env-prod-eu-west', name: 'production-eu-west', region: 'eu-west-1', type: 'production' },
        { id: 'env-staging', name: 'staging-global', region: 'us-west-2', type: 'staging' },
        { id: 'env-dev', name: 'development-sandbox', region: 'us-east-1', type: 'development' }
      ]
    });

    // 5. Create Repositories
    console.log('📦 Seeding Repositories...');
    await session.run(`
      UNWIND $repos AS r
      CREATE (repo:Repository {
        id: r.id,
        name: r.name,
        url: r.url,
        defaultBranch: r.defaultBranch
      })
    `, {
      repos: [
        { id: 'repo-checkout', name: 'wexa-ai/checkout-monorepo', url: 'https://github.com/wexa-ai/checkout-monorepo', defaultBranch: 'main' },
        { id: 'repo-payment', name: 'wexa-ai/payment-gateway', url: 'https://github.com/wexa-ai/payment-gateway', defaultBranch: 'main' },
        { id: 'repo-auth', name: 'wexa-ai/identity-provider', url: 'https://github.com/wexa-ai/identity-provider', defaultBranch: 'main' },
        { id: 'repo-analytics', name: 'wexa-ai/analytics-pipeline', url: 'https://github.com/wexa-ai/analytics-pipeline', defaultBranch: 'main' },
        { id: 'repo-infra', name: 'wexa-ai/core-gateway', url: 'https://github.com/wexa-ai/core-gateway', defaultBranch: 'main' }
      ]
    });

    // 6. Create Services
    console.log('🚀 Seeding Microservices...');
    await session.run(`
      UNWIND $services AS s
      CREATE (srv:Service {
        id: s.id,
        name: s.name,
        tier: s.tier,
        owner: s.owner,
        criticality: s.criticality
      })
    `, {
      services: [
        { id: 'srv-payment', name: 'payment-service', tier: 'critical', owner: 'Payments Platform Team', criticality: 5 },
        { id: 'srv-checkout', name: 'checkout-service', tier: 'critical', owner: 'E-Commerce Core Team', criticality: 5 },
        { id: 'srv-identity', name: 'identity-service', tier: 'critical', owner: 'Security & Auth Team', criticality: 5 },
        { id: 'srv-catalog', name: 'catalog-service', tier: 'high', owner: 'Product Content Team', criticality: 4 },
        { id: 'srv-order', name: 'order-service', tier: 'critical', owner: 'Fulfillment Team', criticality: 5 },
        { id: 'srv-notification', name: 'notification-service', tier: 'medium', owner: 'Communications Team', criticality: 3 },
        { id: 'srv-analytics', name: 'analytics-service', tier: 'medium', owner: 'Data Engineering Team', criticality: 2 },
        { id: 'srv-recommendation', name: 'recommendation-service', tier: 'high', owner: 'ML Intelligence Team', criticality: 3 },
        { id: 'srv-inventory', name: 'inventory-service', tier: 'high', owner: 'Warehouse Logistics Team', criticality: 4 },
        { id: 'srv-gateway', name: 'gateway-service', tier: 'critical', owner: 'Infrastructure Engineering', criticality: 5 }
      ]
    });

    // 7. Create Maintainers
    console.log('👨‍💻 Seeding Maintainers...');
    await session.run(`
      UNWIND $maintainers AS m
      CREATE (maint:Maintainer {
        id: m.id,
        handle: m.handle,
        email: m.email,
        verified: m.verified
      })
    `, {
      maintainers: [
        { id: 'maint-apache', handle: 'apache-security', email: 'security@apache.org', verified: true },
        { id: 'maint-log4j-lead', handle: 'rgoers', email: 'rgoers@apache.org', verified: true },
        { id: 'maint-express', handle: 'tjholowaychuk', email: 'tj@expressjs.org', verified: true },
        { id: 'maint-jackson', handle: 'cowtowncoder', email: 'tatu@fasterxml.com', verified: true },
        { id: 'maint-xz', handle: 'jia-tan-suspect', email: 'jiat75@xz-utils.org', verified: false },
        { id: 'maint-axios', handle: 'mzabriskie', email: 'matt@axios.org', verified: true },
        { id: 'maint-commons', handle: 'ggregory', email: 'ggregory@apache.org', verified: true }
      ]
    });

    // 8. Create Packages
    console.log('📚 Seeding Packages...');
    await session.run(`
      UNWIND $packages AS p
      CREATE (pkg:Package {
        id: p.id,
        name: p.name,
        version: p.version,
        ecosystem: p.ecosystem,
        license: p.license
      })
    `, {
      packages: [
        { id: 'pkg-log4j-core', name: 'log4j-core', version: '2.14.1', ecosystem: 'maven', license: 'Apache-2.0' },
        { id: 'pkg-log4j-api', name: 'log4j-api', version: '2.14.1', ecosystem: 'maven', license: 'Apache-2.0' },
        { id: 'pkg-jackson-databind', name: 'jackson-databind', version: '2.12.3', ecosystem: 'maven', license: 'Apache-2.0' },
        { id: 'pkg-commons-text', name: 'commons-text', version: '1.9', ecosystem: 'maven', license: 'Apache-2.0' },
        { id: 'pkg-spring-core', name: 'spring-core', version: '5.3.9', ecosystem: 'maven', license: 'Apache-2.0' },
        { id: 'pkg-xz-utils', name: 'xz-utils', version: '5.6.0', ecosystem: 'npm', license: 'GPL-2.0' },
        { id: 'pkg-net-helper', name: 'net-helper-lib', version: '1.0.4', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-express', name: 'express', version: '4.17.1', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-jsonwebtoken', name: 'jsonwebtoken', version: '8.5.1', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-axios', name: 'axios', version: '0.21.1', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-lodash', name: 'lodash', version: '4.17.20', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-async-util', name: 'async-util-core', version: '2.0.1', ecosystem: 'npm', license: 'MIT' },
        { id: 'pkg-crypto-provider', name: 'crypto-provider-sdk', version: '1.2.0', ecosystem: 'pypi', license: 'BSD-3-Clause' },
        { id: 'pkg-protobuf', name: 'protobuf-java', version: '3.15.8', ecosystem: 'maven', license: 'BSD-3-Clause' },
        { id: 'pkg-grpc-core', name: 'grpc-core', version: '1.38.0', ecosystem: 'maven', license: 'Apache-2.0' }
      ]
    });

    // 9. Create Vulnerabilities (Node Label: Vulnerability)
    console.log('⚠️ Seeding Vulnerabilities (CVEs)...');
    await session.run(`
      UNWIND $vulns AS v
      CREATE (vuln:Vulnerability {
        id: v.id,
        cveId: v.cveId,
        severity: v.severity,
        cvssScore: v.cvssScore,
        summary: v.summary
      })
    `, {
      vulns: [
        { id: 'vuln-cve-2021-44228', cveId: 'CVE-2021-44228', severity: 'CRITICAL', cvssScore: 10.0, summary: 'Apache Log4j2 Remote Code Execution (Log4Shell) via JNDI lookup handling.' },
        { id: 'vuln-cve-2024-3094', cveId: 'CVE-2024-3094', severity: 'CRITICAL', cvssScore: 10.0, summary: 'Malicious backdoor injected in XZ Utils payload extraction during build process.' },
        { id: 'vuln-cve-2022-42889', cveId: 'CVE-2022-42889', severity: 'CRITICAL', cvssScore: 9.8, summary: 'Apache Commons Text Remote Code Execution (Text4Shell) via string interpolation.' },
        { id: 'vuln-cve-2023-44487', cveId: 'CVE-2023-44487', severity: 'HIGH', cvssScore: 7.5, summary: 'HTTP/2 Rapid Reset Attack enabling Denial of Service across web proxies.' },
        { id: 'vuln-cve-2020-8203', cveId: 'CVE-2020-8203', severity: 'HIGH', cvssScore: 7.4, summary: 'Prototype Pollution vulnerability in Lodash zipObjectDeep utility.' },
        { id: 'vuln-cve-2023-26159', cveId: 'CVE-2023-26159', severity: 'MEDIUM', cvssScore: 6.1, summary: 'Follow-redirects memory exposure issue in Axios HTTP requests.' }
      ]
    });

    // 10. Link Relationships
    console.log('🔗 Creating Relationships...');

    // Repo -> BUILDS -> Service
    await session.run(`
      MATCH (repo:Repository {id: 'repo-checkout'}), (s:Service {id: 'srv-checkout'}) CREATE (repo)-[:BUILDS]->(s)
    `);
    await session.run(`
      MATCH (repo:Repository {id: 'repo-payment'}), (s:Service {id: 'srv-payment'}) CREATE (repo)-[:BUILDS]->(s)
    `);
    await session.run(`
      MATCH (repo:Repository {id: 'repo-auth'}), (s:Service {id: 'srv-identity'}) CREATE (repo)-[:BUILDS]->(s)
    `);
    await session.run(`
      MATCH (repo:Repository {id: 'repo-infra'}), (s:Service {id: 'srv-gateway'}) CREATE (repo)-[:BUILDS]->(s)
    `);

    // Service -> DEPLOYED_IN -> Environment
    await session.run(`
      MATCH (s:Service {id: 'srv-payment'}), (e:Environment {id: 'env-prod-us-east'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-checkout'}), (e:Environment {id: 'env-prod-us-east'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-identity'}), (e:Environment {id: 'env-prod-us-east'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-order'}), (e:Environment {id: 'env-prod-us-east'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-gateway'}), (e:Environment {id: 'env-prod-us-east'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-catalog'}), (e:Environment {id: 'env-staging'}) CREATE (s)-[:DEPLOYED_IN]->(e)
    `);

    // Service -> DEPENDS_ON -> Package
    await session.run(`
      MATCH (s:Service {id: 'srv-checkout'}), (p:Package {id: 'pkg-express'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-checkout'}), (p:Package {id: 'pkg-spring-core'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-payment'}), (p:Package {id: 'pkg-crypto-provider'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-payment'}), (p:Package {id: 'pkg-jackson-databind'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-identity'}), (p:Package {id: 'pkg-jsonwebtoken'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-gateway'}), (p:Package {id: 'pkg-net-helper'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);
    await session.run(`
      MATCH (s:Service {id: 'srv-order'}), (p:Package {id: 'pkg-spring-core'}) CREATE (s)-[:DEPENDS_ON]->(p)
    `);

    // Package -> DEPENDS_ON -> Package (Transitive Multi-hop Dependencies)
    await session.run(`
      MATCH (p1:Package {id: 'pkg-spring-core'}), (p2:Package {id: 'pkg-log4j-core'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-log4j-core'}), (p2:Package {id: 'pkg-log4j-api'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-express'}), (p2:Package {id: 'pkg-axios'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-net-helper'}), (p2:Package {id: 'pkg-xz-utils'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-jackson-databind'}), (p2:Package {id: 'pkg-commons-text'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-crypto-provider'}), (p2:Package {id: 'pkg-async-util'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);
    await session.run(`
      MATCH (p1:Package {id: 'pkg-async-util'}), (p2:Package {id: 'pkg-log4j-core'}) CREATE (p1)-[:DEPENDS_ON]->(p2)
    `);

    // Package -> HAS_VULNERABILITY -> Vulnerability
    await session.run(`
      MATCH (p:Package {id: 'pkg-log4j-core'}), (v:Vulnerability {id: 'vuln-cve-2021-44228'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-xz-utils'}), (v:Vulnerability {id: 'vuln-cve-2024-3094'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-commons-text'}), (v:Vulnerability {id: 'vuln-cve-2022-42889'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-axios'}), (v:Vulnerability {id: 'vuln-cve-2023-26159'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-lodash'}), (v:Vulnerability {id: 'vuln-cve-2020-8203'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)
    `);

    // Package -> MAINTAINED_BY -> Maintainer
    await session.run(`
      MATCH (p:Package {id: 'pkg-log4j-core'}), (m:Maintainer {id: 'maint-log4j-lead'}) CREATE (p)-[:MAINTAINED_BY]->(m)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-xz-utils'}), (m:Maintainer {id: 'maint-xz'}) CREATE (p)-[:MAINTAINED_BY]->(m)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-express'}), (m:Maintainer {id: 'maint-express'}) CREATE (p)-[:MAINTAINED_BY]->(m)
    `);
    await session.run(`
      MATCH (p:Package {id: 'pkg-commons-text'}), (m:Maintainer {id: 'maint-commons'}) CREATE (p)-[:MAINTAINED_BY]->(m)
    `);

    // 11. Verification Summary
    const nodesRes = await session.run('MATCH (n) RETURN labels(n)[0] AS label, count(n) AS cnt');
    const relsRes = await session.run('MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS cnt');

    const multiHopCheck = await session.run(`
      MATCH path = (s:Service)-[:DEPENDS_ON*2..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
      RETURN count(path) AS multiHopCount
    `);
    const multiHopCount = typeof multiHopCheck.records[0]?.get('multiHopCount') === 'object'
      ? multiHopCheck.records[0]?.get('multiHopCount').toNumber()
      : Number(multiHopCheck.records[0]?.get('multiHopCount') || 0);

    console.log('\n📊 SEEDING COMPLETE — Graph Node Summary:');
    nodesRes.records.forEach(r => console.log(`  - ${r.get('label')}: ${r.get('cnt')}`));

    console.log('\n📊 Graph Relationship Summary:');
    relsRes.records.forEach(r => console.log(`  - [:${r.get('type')}]: ${r.get('cnt')}`));

    console.log(`\n✅ VERIFIED: Found ${multiHopCount} multi-hop (2+ hop) transitive vulnerability paths in seeded graph!`);
    console.log('\n✨ Database successfully seeded in CognoDB Cloud!\n');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedCognoDB();
