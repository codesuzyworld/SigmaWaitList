import { supabase } from '../supabase'
import { cache, cacheKeys, cacheTTL } from '../cache'
import { OptimizedProfileService } from './optimizedProfileService'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  session: Session | null
  error?: string
}

/**
 * Optimized Authentication Service with session caching
 * Reduces auth-related database calls and improves performance
 */
export class OptimizedAuthService {
  private static authStateListeners: ((user: User | null) => void)[] = []

  /**
   * Get current session with caching
   */
  static async getCurrentSession(): Promise<Session | null> {
    const cacheKey = cacheKeys.authSession()
    const cached = cache.get<Session>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      if (session) {
        // Cache session for 30 minutes
        cache.set(cacheKey, session, cacheTTL.SESSION)
      }

      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  /**
   * Get current user with caching
   */
  static async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession()
    return session?.user || null
  }

  /**
   * Sign up with automatic profile creation
   */
  static async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      // Clear auth cache
      this.clearAuthCache()

      // Pre-create profile entry if user was created
      if (data.user && !data.user.email_confirmed_at) {
        try {
          // Create basic profile entry
          await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id,
              email: data.user.email,
              has_access: true 
            }])
        } catch (profileError) {
          console.log('Profile creation will be handled by trigger')
        }
      }

      this.notifyAuthStateListeners(data.user)

      return {
        user: data.user,
        session: data.session,
        error: undefined
      }
    } catch (error: any) {
      return { user: null, session: null, error: error.message }
    }
  }

  /**
   * Sign in with session caching
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      // Cache new session
      if (data.session) {
        cache.set(cacheKeys.authSession(), data.session, cacheTTL.SESSION)
      }

      this.notifyAuthStateListeners(data.user)

      return {
        user: data.user,
        session: data.session,
        error: undefined
      }
    } catch (error: any) {
      return { user: null, session: null, error: error.message }
    }
  }

  /**
   * Sign out with complete cache clearing
   */
  static async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }

      // Clear all caches
      this.clearAllUserCache()
      
      this.notifyAuthStateListeners(null)

      return { error: error?.message }
    } catch (error: any) {
      console.error('Sign out error:', error)
      this.clearAllUserCache()
      this.notifyAuthStateListeners(null)
      return { error: error.message }
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      // Clear session cache to force refresh
      cache.delete(cacheKeys.authSession())

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  /**
   * Refresh session
   */
  static async refreshSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        return { session: null, error: error.message }
      }

      // Update cache with new session
      if (data.session) {
        cache.set(cacheKeys.authSession(), data.session, cacheTTL.SESSION)
      }

      return { session: data.session }
    } catch (error: any) {
      return { session: null, error: error.message }
    }
  }

  /**
   * Listen to auth state changes (optimized)
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    // Add to local listeners
    this.authStateListeners.push(callback)

    // Set up Supabase listener only once
    if (this.authStateListeners.length === 1) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event)
          
          // Clear auth cache on any change
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            cache.delete(cacheKeys.authSession())
          }

          if (event === 'SIGNED_OUT') {
            this.clearAllUserCache()
          }

          // Cache new session
          if (session) {
            cache.set(cacheKeys.authSession(), session, cacheTTL.SESSION)
          }

          // Notify all listeners
          this.notifyAuthStateListeners(session?.user || null)
        }
      )

      // Store subscription for cleanup
      this.authSubscription = subscription
    }

    // Return cleanup function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }

      // Clean up Supabase listener if no more listeners
      if (this.authStateListeners.length === 0 && this.authSubscription) {
        this.authSubscription.unsubscribe()
        this.authSubscription = null
      }
    }
  }

  /**
   * Check if user has specific permissions (cached)
   */
  static async checkUserPermissions(userId: string): Promise<{ hasAccess: boolean; isAdmin: boolean }> {
    const cacheKey = cacheKeys.userPermissions(userId)
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_access, customer_id')
        .eq('id', userId)
        .single()

      if (error) throw error

      const permissions = {
        hasAccess: data?.has_access || false,
        isAdmin: data?.customer_id === 'admin' // Simple admin check
      }

      // Cache for 15 minutes
      cache.set(cacheKey, permissions, cacheTTL.LONG)

      return permissions
    } catch (error) {
      console.error('Error checking permissions:', error)
      return { hasAccess: false, isAdmin: false }
    }
  }

  /**
   * Warm authentication cache
   */
  static async warmAuthCache(): Promise<void> {
    try {
      const session = await this.getCurrentSession()
      if (session?.user) {
        // Preload user permissions
        await this.checkUserPermissions(session.user.id)
        
        // Preload user profile
        await OptimizedProfileService.getCompleteProfile(session.user.id)
      }
      
      console.log('🔥 Auth cache warmed')
    } catch (error) {
      console.error('Error warming auth cache:', error)
    }
  }

  /**
   * Clear auth-specific cache
   */
  private static clearAuthCache(): void {
    cache.delete(cacheKeys.authSession())
  }

  /**
   * Clear all user-related cache
   */
  private static clearAllUserCache(): void {
    cache.clear() // Clear everything for security
  }

  /**
   * Notify all auth state listeners
   */
  private static notifyAuthStateListeners(user: User | null): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error in auth state listener:', error)
      }
    })
  }

  private static authSubscription: any = null
}