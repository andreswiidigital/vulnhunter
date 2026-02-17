import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scans, vulnerabilities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const { scanId } = params;

    // Busca o scan
    const [scan] = await db.select().from(scans).where(eq(scans.id, scanId));

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }

    // Busca vulnerabilidades do scan
    const vulns = await db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.scanId, scanId));

    return NextResponse.json({
      scan,
      vulnerabilities: vulns,
      summary: {
        total: vulns.length,
        critical: vulns.filter(v => v.severity === 'CRITICAL').length,
        high: vulns.filter(v => v.severity === 'HIGH').length,
        medium: vulns.filter(v => v.severity === 'MEDIUM').length,
        low: vulns.filter(v => v.severity === 'LOW').length,
        exploited: vulns.filter(v => v.exploited).length,
      },
    });

  } catch (error) {
    console.error('Error fetching scan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
