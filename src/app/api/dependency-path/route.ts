import { NextRequest, NextResponse } from 'next/server';
import { fetchDependencyPath } from '@/lib/cypher';
import { sanitizeStringParam } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceName = sanitizeStringParam(searchParams.get('service'), 'payment-service');
    const packageName = sanitizeStringParam(searchParams.get('package'), 'log4j-core');

    const { result, isConnected } = await fetchDependencyPath(serviceName, packageName);

    return NextResponse.json(
      { ...result, isConnected, source: isConnected ? 'cognoDB' : 'demo_fallback' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search dependency path' },
      { status: 500 }
    );
  }
}
