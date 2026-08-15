import { NextResponse } from 'next/server';
import { checkCognoDBHealth } from '@/lib/cognodb';

export async function GET() {
  try {
    const health = await checkCognoDBHealth();
    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'demo_mode',
        message: `Health check error: ${error.message || 'Unknown error'}. Active in Demo Fallback Mode.`,
      },
      { status: 200 }
    );
  }
}
