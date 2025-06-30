import { supabase } from '../supabase'

export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

export interface WaitlistStats {
  totalSignups: number
  todaySignups: number
  weekSignups: number
  monthSignups: number
}

export class WaitlistService {
  /**
   * Add email to waitlist
   */
  static async addToWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      // Check if email already exists
      const exists = await this.checkEmailExists(email)
      if (exists) {
        return { success: false, error: 'Email already registered' }
      }

      // Insert into waitlist
      const { error } = await supabase
        .from('leads')
        .insert([{ email: email.toLowerCase().trim() }])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'Email already registered' }
        }
        throw error
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error adding to waitlist:', error)
      return { success: false, error: 'Failed to join waitlist. Please try again.' }
    }
  }

  /**
   * Check if email exists in waitlist
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (error) throw error

      return data.length > 0
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }
  }

  /**
   * Get waitlist statistics
   */
  static async getWaitlistStats(): Promise<WaitlistStats> {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

      // Get total signups
      const { count: totalSignups, error: totalError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      if (totalError) throw totalError

      // Get today's signups
      const { count: todaySignups, error: todayError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      if (todayError) throw todayError

      // Get week's signups
      const { count: weekSignups, error: weekError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      if (weekError) throw weekError

      // Get month's signups
      const { count: monthSignups, error: monthError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString())

      if (monthError) throw monthError

      return {
        totalSignups: totalSignups || 0,
        todaySignups: todaySignups || 0,
        weekSignups: weekSignups || 0,
        monthSignups: monthSignups || 0
      }
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
   * Get recent waitlist entries (admin only)
   */
  static async getRecentEntries(limit: number = 10): Promise<WaitlistEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting recent entries:', error)
      return []
    }
  }

  /**
   * Export waitlist data (admin only)
   */
  static async exportWaitlist(): Promise<{ data: WaitlistEntry[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error: any) {
      console.error('Error exporting waitlist:', error)
      return { data: [], error: error.message }
    }
  }

  /**
   * Remove email from waitlist (admin only)
   */
  static async removeFromWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('email', email.toLowerCase().trim())

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error removing from waitlist:', error)
      return { success: false, error: error.message }
    }
  }
}