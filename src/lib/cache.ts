/**
 * Simple in-memory cache to reduce database calls
 * Optimized for Supabase cost reduction
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class Cache {
  private store = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes default

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) return null
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.store.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove specific key
   */
  delete(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0
    
    for (const entry of this.store.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      } else {
        active++
      }
    }
    
    return { total: this.store.size, active, expired }
  }
}

// Singleton cache instance
export const cache = new Cache()

// Auto-cleanup every 10 minutes
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)

// Cache key generators for consistent naming
export const cacheKeys = {
  userProfile: (userId: string) => `user_profile:${userId}`,
  profileSettings: (userId: string) => `profile_settings:${userId}`,
  basicProfile: (userId: string) => `basic_profile:${userId}`,
  waitlistStats: () => 'waitlist_stats',
  usernameCheck: (username: string) => `username_check:${username}`,
  
  // Session-level cache (short TTL)
  authSession: () => 'auth_session',
  userPermissions: (userId: string) => `user_permissions:${userId}`,
}

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  SESSION: 30 * 60 * 1000,   // 30 minutes
}