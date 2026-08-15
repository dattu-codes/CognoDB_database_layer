import { NextResponse } from 'next/server';
import { fetchRiskDependencies } from '@/lib/cypher';

export async function GET() {
  try {
    const { riskDependencies, isConnected } = await fetchRiskDependencies();
    return NextResponse.json(
      { riskDependencies, isConnected, source: isConnected ? 'cognoDB' : 'demo_fallback' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch risk dependencies' },
      { status: 500 }
    );
  }
}
