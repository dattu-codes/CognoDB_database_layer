import neo4j, { Driver, Session, ServerInfo } from 'neo4j-driver';
import { HealthStatus } from './types';

// CognoDB Cloud Connection Layer using Official Neo4j Driver (openCypher over Bolt)

let driverInstance: Driver | null = null;

export function getCognoDBDriver(): Driver | null {
  const uri = process.env.COGNODB_URI;
  const username = process.env.COGNODB_USERNAME || 'cognodb';
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    return null;
  }

  if (!driverInstance) {
    try {
      driverInstance = neo4j.driver(uri, neo4j.auth.basic(username, password), {
        maxConnectionPoolSize: 50,
        connectionTimeout: 10000,
        disableLosslessIntegers: true, // Auto convert Neo4j Integers to JS Numbers
      });
    } catch (error) {
      console.error('[CognoDB] Failed to initialize Neo4j driver:', error);
      return null;
    }
  }

  return driverInstance;
}

export async function checkCognoDBHealth(): Promise<HealthStatus> {
  const uri = process.env.COGNODB_URI;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    return {
      status: 'demo_mode',
      message: 'CognoDB credentials not configured in environment variables. Running in bundled Demo Fallback Mode.',
    };
  }

  const driver = getCognoDBDriver();
  if (!driver) {
    return {
      status: 'demo_mode',
      message: 'Failed to instantiate Neo4j driver for CognoDB. Falling back to Demo Mode.',
      uri,
    };
  }

  let session: Session | null = null;
  try {
    session = driver.session();
    const serverInfo: ServerInfo = await driver.getServerInfo();

    // Verify database counts
    const result = await session.run('MATCH (n) RETURN count(n) AS nodeCount');
    const nodeCount = result.records[0]?.get('nodeCount') ?? 0;

    const relResult = await session.run('MATCH ()-[r]->() RETURN count(r) AS relCount');
    const relationshipCount = relResult.records[0]?.get('relCount') ?? 0;

    return {
      status: 'connected',
      message: 'Successfully connected to CognoDB Cloud instance over Bolt protocol.',
      uri,
      database: serverInfo.agent || 'CognoDB openCypher Engine',
      nodeCount: typeof nodeCount === 'object' && 'toNumber' in nodeCount ? nodeCount.toNumber() : Number(nodeCount),
      relationshipCount: typeof relationshipCount === 'object' && 'toNumber' in relationshipCount ? relationshipCount.toNumber() : Number(relationshipCount),
    };
  } catch (error: any) {
    console.warn('[CognoDB] Health check connection error:', error.message || error);
    return {
      status: 'demo_mode',
      message: `Database unreachable (${error.message || 'Connection timeout'}). Falling back to bundled Demo Mode dataset.`,
      uri,
    };
  } finally {
    if (session) {
      await session.close();
    }
  }
}

export async function executeCypher<T = any>(
  cypher: string,
  params: Record<string, any> = {}
): Promise<{ records: T[]; isConnected: boolean }> {
  const driver = getCognoDBDriver();
  if (!driver) {
    return { records: [], isConnected: false };
  }

  let session: Session | null = null;
  try {
    session = driver.session();
    const result = await session.run(cypher, params);
    
    const records = result.records.map(record => {
      const obj: Record<string, any> = {};
      record.keys.forEach(key => {
        const val = record.get(key);
        obj[key as string] = parseNeo4jValue(val);
      });
      return obj as T;
    });

    return { records, isConnected: true };
  } catch (error: any) {
    console.error('[CognoDB] Cypher execution error:', error);
    return { records: [], isConnected: false };
  } finally {
    if (session) {
      await session.close();
    }
  }
}

function parseNeo4jValue(val: any): any {
  if (val === null || val === undefined) return null;
  
  if (typeof val === 'object' && 'toNumber' in val && typeof val.toNumber === 'function') {
    return val.toNumber();
  }

  if (Array.isArray(val)) {
    return val.map(parseNeo4jValue);
  }

  if (val && typeof val === 'object' && 'labels' in val && 'properties' in val) {
    // Neo4j Node
    return {
      id: val.elementId || val.identity?.toString() || val.properties.id,
      label: val.labels[0],
      properties: parseNeo4jValue(val.properties),
    };
  }

  if (val && typeof val === 'object' && 'type' in val && 'properties' in val) {
    // Neo4j Relationship
    return {
      id: val.elementId || val.identity?.toString(),
      type: val.type,
      properties: parseNeo4jValue(val.properties),
    };
  }

  if (typeof val === 'object' && !Array.isArray(val)) {
    const parsed: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      parsed[k] = parseNeo4jValue(v);
    }
    return parsed;
  }

  return val;
}
