import { NextRequest, NextResponse } from 'next/server';
import { fetchBlastRadius } from '@/lib/cypher';
import { sanitizeCveId } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawCve = searchParams.get('cve') || searchParams.get('cveId');
    const cveId = sanitizeCveId(rawCve);

    const { result, isConnected } = await fetchBlastRadius(cveId);

    return NextResponse.json(
      { ...result, isConnected, source: isConnected ? 'cognoDB' : 'demo_fallback' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate vulnerability blast radius' },
      { status: 500 }
    );
  }
}
