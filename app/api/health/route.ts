/**
 * Health Check API Route
 *
 * Returns service health status for monitoring and load balancers.
 * Checks database connectivity and returns system info.
 *
 * SECURITY: This endpoint implements a simple API key check to prevent
 * unauthorized probing of system status. The health check API key should
 * be provided via the X-Health-Check-Key header.
 *
 * For production deployments, consider using:
 * - Dedicated monitoring networks (VPC-only access)
 * - Reverse proxy authentication (Cloudflare Access, etc.)
 * - OAuth2/JWT authentication for monitoring systems
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple health check endpoint for monitoring systems
export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify health check API key if configured
  // This prevents unauthorized probing but allows legitimate monitoring
  const expectedKey = process.env.HEALTH_CHECK_KEY;
  if (expectedKey) {
    const providedKey = request.headers.get('X-Health-Check-Key');
    if (providedKey !== expectedKey) {
      // Return 401 without revealing that the endpoint exists
      return new NextResponse(null, { status: 401 });
    }
  }

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const uptime = Date.now() - startTime;

    // Return minimal health information
    // Avoid exposing database details, version info, or other sensitive data
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime_ms: uptime,
    });
  } catch (error) {
    console.error('Health check failed:', error);

    // Return generic error message without exposing database details
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
