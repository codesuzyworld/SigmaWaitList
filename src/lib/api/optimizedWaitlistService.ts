import { supabase } from '../supabase'
import { cache, cacheKeys, cacheTTL } from '../cache'
import type { WaitlistEntry, WaitlistStats } from './waitlistService'

/**
 * Optimized Waitlist Service with caching and rate limiting
 * Reduces database load for public-facing waitlist operations
 */
export class OptimizedWaitlistService {
  private static recentSubmissions = new Set<string>()
  private static submissionCooldown = 60 * 1000 // 1 minute cooldown per email

  /**
   * Add email to waitlist with duplicate detection and rate limiting
   */
  static async addToWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Rate limiting check
      if (this.recentSubmissions.has(normalizedEmail)) {
        return { success: false, error: 'Please wait before submitting again' }
      }

      // Check cache for recent duplicate check
      const duplicateCheckKey = `email_exists:${normalizedEmail}`
      const cachedExists = cache.get<boolean>(duplicateCheckKey)
      
      if (cachedExists === true) {
        return { success: false, error: 'Email already registered' }
      }

      // Single upsert operation (handles duplicates at database level)
      const { error } = await supabase
        .from('leads')
        .insert([{ email: normalizedEmail }])
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          // Cache the duplicate result
          cache.set(duplicateCheckKey, true, cacheTTL.LONG)
          return { success: false, error: 'Email already registered' }
        }
        throw error
      }

      // Add to rate limiting and cache success
      this.recentSubmissions.add(normalizedEmail)
      setTimeout(() => {
        this.recentSubmissions.delete(normalizedEmail)
      }, this.submissionCooldown)

      // Cache that email exists to prevent future duplicates
      cache.set(duplicateCheckKey, true, cacheTTL.LONG)

      // Invalidate stats cache
      cache.delete(cacheKeys.waitlistStats())

      return { success: true }
    } catch (error: any) {
      console.error('Error adding to waitlist:', error)
      return { success: false, error: 'Failed to join waitlist. Please try again.' }
    }
  }

  /**
   * Get waitlist statistics with caching
   */
  static async getWaitlistStats(): Promise<WaitlistStats> {
    const cacheKey = cacheKeys.waitlistStats()
    const cached = cache.get<WaitlistStats>(cacheKey)
    
    if (cached) {
      console.log('📊 Stats loaded from cache')
      return cached
    }

    try {
      console.log('🔄 Loading stats from database...')
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

      // Use single query with conditional counting for better performance
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          created_at,
          count: count()
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate stats from the data
      const totalSignups = data?.length || 0
      let todaySignups = 0
      let weekSignups = 0
      let monthSignups = 0

      for (const lead of data || []) {
        const createdAt = new Date(lead.created_at)
        
        if (createdAt >= today) todaySignups++
        if (createdAt >= weekAgo) weekSignups++
        if (createdAt >= monthAgo) monthSignups++
      }

      const stats: WaitlistStats = {
        totalSignups,
        todaySignups,
        weekSignups,
        monthSignups
      }

      // Cache for 5 minutes
      cache.set(cacheKey, stats, cacheTTL.MEDIUM)

      return stats
    } catch (error) {
      console.error('Error getting waitlist stats:', error)
      return {
        totalSignups: 0,
        todaySignups: 0,
        weekSignups: 0,
        monthSignups: 0
      }
    }
  }

  /**
   * Check if email exists (cached)
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim()
    const cacheKey = `email_exists:${normalizedEmail}`
    const cached = cache.get<boolean>(cacheKey)
    
    if (cached !== null) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('email', normalizedEmail)
        .limit(1)
        .maybeSingle()

      if (error) throw error

      const exists = !!data
      
      // Cache result for 15 minutes
      cache.set(cacheKey, exists, cacheTTL.LONG)
      
      return exists
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }
  }

  /**
   * Get recent entries with pagination and caching
   */
  static async getRecentEntries(limit: number = 10, offset: number = 0): Promise<WaitlistEntry[]> {
    const cacheKey = `recent_entries:${limit}:${offset}`
    const cached = cache.get<WaitlistEntry[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const entries = data || []
      
      // Cache for 2 minutes (recent entries change frequently)
      cache.set(cacheKey, entries, cacheTTL.SHORT * 2)

      return entries
    } catch (error) {
      console.error('Error getting recent entries:', error)
      return []
    }
  }

  /**
   * Export waitlist with streaming for large datasets
   */
  static async exportWaitlist(limit?: number): Promise<{ data: WaitlistEntry[]; error?: string }> {
    try {
      let query = supabase
        .from('leads')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Error exporting waitlist:', error)
      return { data: [], error: error.message }
    }
  }

  /**
   * Get paginated stats for admin dashboard
   */
  static async getPaginatedStats(page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize
    const cacheKey = `paginated_stats:${page}:${pageSize}`
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const [entriesResult, countResult] = await Promise.all([
        this.getRecentEntries(pageSize, offset),
        this.getWaitlistStats()
      ])

      const result = {
        entries: entriesResult,
        totalCount: countResult.totalSignups,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(countResult.totalSignups / pageSize)
      }

      // Cache for 1 minute
      cache.set(cacheKey, result, cacheTTL.SHORT)

      return result
    } catch (error) {
      console.error('Error getting paginated stats:', error)
      return {
        entries: [],
        totalCount: 0,
        currentPage: page,
        pageSize,
        totalPages: 0
      }
    }
  }

  /**
   * Preload common data to warm cache
   */
  static async warmCache(): Promise<void> {
    try {
      // Preload stats
      await this.getWaitlistStats()
      
      // Preload recent entries
      await this.getRecentEntries(20)
      
      console.log('🔥 Waitlist cache warmed')
    } catch (error) {
      console.error('Error warming cache:', error)
    }
  }
}