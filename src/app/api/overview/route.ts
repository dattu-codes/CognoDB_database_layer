import { NextResponse } from 'next/server';
import { fetchOverview } from '@/lib/cypher';

export async function GET() {
  try {
    const { overview, isConnected } = await fetchOverview();
    return NextResponse.json(
      { overview, isConnected, source: isConnected ? 'cognoDB' : 'demo_fallback' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
