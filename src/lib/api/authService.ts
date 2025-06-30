import { supabase } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  session: Session | null
  error?: string
}

export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

export class AuthService {
  /**
   * Sign up a new user
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
   * Sign in an existing user
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
   * Sign out the current user
   */
  static async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
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
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
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
   * Check password strength
   */
  static checkPasswordStrength(password: string): PasswordStrength {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 1
    else feedback.push('At least 8 characters')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Lowercase letter')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Uppercase letter')

    if (/\d/.test(password)) score += 1
    else feedback.push('Number')

    if (/[^a-zA-Z\d]/.test(password)) score += 1
    else feedback.push('Special character')

    return {
      score,
      feedback,
      isValid: score >= 3
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
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

      return { session: data.session }
    } catch (error: any) {
      return { session: null, error: error.message }
    }
  }
}