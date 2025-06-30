/**
 * Application initialization and optimization
 * Warms caches and preloads critical data
 */

import { OptimizedAuthService } from './api/optimizedAuthService'
import { OptimizedWaitlistService } from './api/optimizedWaitlistService'
import { cache } from './cache'

/**
 * Initialize the application with optimizations
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log('🚀 Initializing Sigma Waitlist...')

    // Start cache warming in parallel
    const warmingPromises = [
      OptimizedAuthService.warmAuthCache(),
      OptimizedWaitlistService.warmCache(),
    ]

    // Wait for cache warming with timeout
    await Promise.race([
      Promise.all(warmingPromises),
      new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
    ])

    console.log('✅ Sigma Waitlist initialized')
    console.log('📊 Cache stats:', cache.getStats())

    // Schedule periodic cache cleanup
    schedulePeriodicCleanup()

  } catch (error) {
    console.error('❌ App initialization error:', error)
    // Continue loading even if warming fails
  }
}

/**
 * Schedule periodic cache cleanup and optimization
 */
function schedulePeriodicCleanup(): void {
  // Clean cache every 5 minutes
  setInterval(() => {
    cache.cleanup()
    console.log('🧹 Cache cleaned:', cache.getStats())
  }, 5 * 60 * 1000)

  // Log cache stats every 10 minutes in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      console.log('📊 Cache stats:', cache.getStats())
    }, 10 * 60 * 1000)
  }
}

/**
 * Preload critical data for authenticated users
 */
export async function preloadUserData(userId: string): Promise<void> {
  try {
    // Preload user profile and permissions in parallel
    await Promise.all([
      OptimizedAuthService.checkUserPermissions(userId),
    ])

    console.log('👤 User data preloaded')
  } catch (error) {
    console.error('Error preloading user data:', error)
  }
}

/**
 * Clear all caches (on logout or error)
 */
export function clearAllCaches(): void {
  cache.clear()
  console.log('🗑️ All caches cleared')
}

/**
 * Get application performance stats
 */
export function getPerformanceStats() {
  return {
    cache: cache.getStats(),
    memory: {
      used: (performance as any).memory?.usedJSHeapSize || 0,
      total: (performance as any).memory?.totalJSHeapSize || 0,
      limit: (performance as any).memory?.jsHeapSizeLimit || 0,
    },
    timing: performance.now()
  }
}