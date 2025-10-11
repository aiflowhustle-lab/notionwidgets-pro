interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstLimit: number;
  burstWindowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private burstRequests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor() {
    this.config = {
      maxRequests: 3, // 3 requests per second (Notion API limit)
      windowMs: 1000, // 1 second window
      burstLimit: 10, // 10 requests burst limit
      burstWindowMs: 10000, // 10 second burst window
    };
  }

  private getKey(identifier: string): string {
    return `notion-api:${identifier}`;
  }

  private cleanupOldRequests(requests: number[], windowMs: number): number[] {
    const now = Date.now();
    return requests.filter(timestamp => now - timestamp < windowMs);
  }

  async canMakeRequest(identifier: string = 'default'): Promise<boolean> {
    const key = this.getKey(identifier);
    const now = Date.now();

    // Clean up old requests
    const currentRequests = this.cleanupOldRequests(
      this.requests.get(key) || [],
      this.config.windowMs
    );
    const currentBurstRequests = this.cleanupOldRequests(
      this.burstRequests.get(key) || [],
      this.config.burstWindowMs
    );

    // Check burst limit
    if (currentBurstRequests.length >= this.config.burstLimit) {
      console.log(`Rate limit exceeded (burst): ${currentBurstRequests.length}/${this.config.burstLimit}`);
      return false;
    }

    // Check regular rate limit
    if (currentRequests.length >= this.config.maxRequests) {
      console.log(`Rate limit exceeded (regular): ${currentRequests.length}/${this.config.maxRequests}`);
      return false;
    }

    return true;
  }

  async recordRequest(identifier: string = 'default'): Promise<void> {
    const key = this.getKey(identifier);
    const now = Date.now();

    // Record regular request
    const currentRequests = this.cleanupOldRequests(
      this.requests.get(key) || [],
      this.config.windowMs
    );
    currentRequests.push(now);
    this.requests.set(key, currentRequests);

    // Record burst request
    const currentBurstRequests = this.cleanupOldRequests(
      this.burstRequests.get(key) || [],
      this.config.burstWindowMs
    );
    currentBurstRequests.push(now);
    this.burstRequests.set(key, currentBurstRequests);
  }

  async waitForNextAvailable(identifier: string = 'default'): Promise<void> {
    const key = this.getKey(identifier);
    const currentRequests = this.cleanupOldRequests(
      this.requests.get(key) || [],
      this.config.windowMs
    );

    if (currentRequests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...currentRequests);
      const waitTime = this.config.windowMs - (Date.now() - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`Rate limiting: waiting ${waitTime}ms for next available slot`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  getStats(identifier: string = 'default') {
    const key = this.getKey(identifier);
    const currentRequests = this.cleanupOldRequests(
      this.requests.get(key) || [],
      this.config.windowMs
    );
    const currentBurstRequests = this.cleanupOldRequests(
      this.burstRequests.get(key) || [],
      this.config.burstWindowMs
    );

    return {
      regularRequests: currentRequests.length,
      maxRegularRequests: this.config.maxRequests,
      burstRequests: currentBurstRequests.length,
      maxBurstRequests: this.config.burstLimit,
      canMakeRequest: currentRequests.length < this.config.maxRequests && 
                     currentBurstRequests.length < this.config.burstLimit,
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Export types
export type { RateLimitConfig };
