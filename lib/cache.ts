import { createClient, RedisClientType } from 'redis';
import { NotionPost } from '@/types';

interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  redisUrl?: string;
  redisPassword?: string;
  redisDb?: number;
}

class CacheService {
  private redis: RedisClientType | null = null;
  private memoryCache: Map<string, { data: any; expires: number }> = new Map();
  private config: CacheConfig;
  private isRedisConnected = false;

  constructor() {
    this.config = {
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.CACHE_TTL_SECONDS || '30'), // 30 seconds default for faster updates
      redisUrl: process.env.REDIS_URL,
      redisPassword: process.env.REDIS_PASSWORD,
      redisDb: parseInt(process.env.REDIS_DB || '0'),
    };

    if (this.config.enabled && this.config.redisUrl) {
      this.initializeRedis();
    }
  }

  private async initializeRedis() {
    try {
      this.redis = createClient({
        url: this.config.redisUrl,
        password: this.config.redisPassword,
        database: this.config.redisDb,
      });

      this.redis.on('error', (err) => {
        console.warn('Redis connection error:', err);
        this.isRedisConnected = false;
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.isRedisConnected = true;
      });

      await this.redis.connect();
    } catch (error) {
      console.warn('Failed to connect to Redis, falling back to memory cache:', error);
      this.redis = null;
      this.isRedisConnected = false;
    }
  }

  private generateCacheKey(widgetId: string, platformFilter?: string, statusFilter?: string): string {
    const platform = platformFilter || 'all';
    const status = statusFilter || 'all';
    return `widget:${widgetId}:${platform}:${status}`;
  }

  async get(widgetId: string, platformFilter?: string, statusFilter?: string): Promise<NotionPost[] | null> {
    if (!this.config.enabled) return null;

    const cacheKey = this.generateCacheKey(widgetId, platformFilter, statusFilter);

    try {
      // Try Redis first
      if (this.redis && this.isRedisConnected) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          console.log(`Cache HIT (Redis): ${cacheKey}`);
          return JSON.parse(cached);
        }
      }

      // Fallback to memory cache
      const memoryCached = this.memoryCache.get(cacheKey);
      if (memoryCached && memoryCached.expires > Date.now()) {
        console.log(`Cache HIT (Memory): ${cacheKey}`);
        return memoryCached.data;
      }

      // Clean up expired memory cache entries
      if (memoryCached && memoryCached.expires <= Date.now()) {
        this.memoryCache.delete(cacheKey);
      }

      console.log(`Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(widgetId: string, data: NotionPost[], platformFilter?: string, statusFilter?: string): Promise<void> {
    if (!this.config.enabled) return;

    const cacheKey = this.generateCacheKey(widgetId, platformFilter, statusFilter);
    const expiresAt = Date.now() + (this.config.ttl * 1000);

    try {
      // Store in Redis
      if (this.redis && this.isRedisConnected) {
        await this.redis.setEx(cacheKey, this.config.ttl, JSON.stringify(data));
        console.log(`Cache SET (Redis): ${cacheKey}`);
      }

      // Also store in memory cache as backup
      this.memoryCache.set(cacheKey, {
        data,
        expires: expiresAt,
      });
      console.log(`Cache SET (Memory): ${cacheKey}`);

      // Clean up old memory cache entries periodically
      this.cleanupMemoryCache();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(widgetId: string): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Invalidate all cache entries for this widget
      const pattern = `widget:${widgetId}:*`;
      
      if (this.redis && this.isRedisConnected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
          console.log(`Cache INVALIDATED (Redis): ${keys.length} keys for widget ${widgetId}`);
        }
      }

      // Invalidate memory cache
      const memoryKeys = Array.from(this.memoryCache.keys()).filter(key => key.startsWith(`widget:${widgetId}:`));
      memoryKeys.forEach(key => this.memoryCache.delete(key));
      console.log(`Cache INVALIDATED (Memory): ${memoryKeys.length} keys for widget ${widgetId}`);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  private cleanupMemoryCache() {
    // Clean up expired entries every 100 operations
    if (this.memoryCache.size % 100 === 0) {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      this.memoryCache.forEach((value, key) => {
        if (value.expires <= now) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    }
  }

  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  getStats() {
    return {
      enabled: this.config.enabled,
      redisConnected: this.isRedisConnected,
      memoryCacheSize: this.memoryCache.size,
      ttl: this.config.ttl,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export types for use in other files
export type { CacheConfig };
