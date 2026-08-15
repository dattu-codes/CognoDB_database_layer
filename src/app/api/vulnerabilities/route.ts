import { NextResponse } from 'next/server';
import { fetchVulnerabilityList } from '@/lib/cypher';

export async function GET() {
  try {
    const { vulnerabilities, isConnected } = await fetchVulnerabilityList();
    return NextResponse.json(
      { vulnerabilities, isConnected, source: isConnected ? 'cognoDB' : 'demo_fallback' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vulnerability list' },
      { status: 500 }
    );
  }
}
