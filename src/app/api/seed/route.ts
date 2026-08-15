import { NextResponse } from 'next/server';
import { checkCognoDBHealth } from '@/lib/cognodb';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    const health = await checkCognoDBHealth();
    if (health.status !== 'connected') {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot seed database: CognoDB Cloud instance is not connected. Please check COGNODB_URI and COGNODB_PASSWORD in .env.local.',
        },
        { status: 400 }
      );
    }

    // Execute seed script
    const { stdout, stderr } = await execPromise('npx tsx scripts/seed.ts');
    console.log('[Seed API Output]:', stdout);

    if (stderr && !stderr.includes('warn')) {
      console.warn('[Seed API Stderr]:', stderr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully re-seeded CognoDB Cloud database graph!',
        output: stdout,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Seed API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to seed database: ${error.message || 'Unknown execution error'}`,
      },
      { status: 500 }
    );
  }
}
