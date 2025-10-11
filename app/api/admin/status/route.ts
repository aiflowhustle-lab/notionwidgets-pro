import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const cacheStats = cacheService.getStats();
    
    // Get rate limiter statistics
    const rateLimitStats = rateLimiter.getStats();
    
    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      cacheEnabled: process.env.CACHE_ENABLED,
      cacheTtl: process.env.CACHE_TTL_SECONDS,
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
    };
    
    const status = {
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      rateLimiter: rateLimitStats,
      environment: envInfo,
      health: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      }
    };
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    return NextResponse.json({ 
      error: 'Failed to get status',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
