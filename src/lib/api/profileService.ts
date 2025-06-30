import { supabase } from '../supabase'

export interface CompleteProfile {
  id: string
  name?: string
  username?: string
  bio?: string
  profile_picture_url?: string
  profile_visibility?: 'public' | 'private' | 'friends'
  contact_preferences?: {
    email: boolean
    phone: boolean
    marketing: boolean
  }
  notification_preferences?: {
    email: boolean
    push: boolean
    in_app: boolean
    marketing: boolean
  }
  email_verified?: boolean
  language?: string
  region?: string
  stealth_mode?: boolean
  sdg_goals?: string[]
  low_tech_access?: boolean
  business_type?: string
  time_commitment?: string
  capital_level?: string
  completion_percentage?: number
  created_at?: string
  updated_at?: string
}

export interface BasicProfile {
  id: string
  name?: string
  email?: string
  image?: string
  has_access?: boolean
  created_at?: string
  updated_at?: string
}

export class ProfileService {
  /**
   * Get complete user profile by merging data from both tables
   */
  static async getCompleteProfile(userId: string): Promise<CompleteProfile | null> {
    try {
      // Get enhanced profile data
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        throw userProfileError
      }

      // Get basic profile data
      const { data: basicProfile, error: basicProfileError } = await supabase
        .from('profiles')
        .select('name, email, image, has_access, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()

      if (basicProfileError && basicProfileError.code !== 'PGRST116') {
        throw basicProfileError
      }

      // Merge data from both tables
      const mergedProfile: CompleteProfile = {
        id: userId,
        name: basicProfile?.name || userProfile?.name || '',
        username: userProfile?.username || '',
        bio: userProfile?.bio || '',
        profile_picture_url: userProfile?.profile_picture_url || basicProfile?.image || '',
        profile_visibility: userProfile?.profile_visibility || 'public',
        contact_preferences: userProfile?.contact_preferences || {
          email: true,
          phone: false,
          marketing: false
        },
        notification_preferences: userProfile?.notification_preferences || {
          email: true,
          push: true,
          in_app: true,
          marketing: false
        },
        email_verified: userProfile?.email_verified || false,
        language: userProfile?.language || 'en',
        region: userProfile?.region || '',
        stealth_mode: userProfile?.stealth_mode || false,
        sdg_goals: userProfile?.sdg_goals || [],
        low_tech_access: userProfile?.low_tech_access || false,
        business_type: userProfile?.business_type || '',
        time_commitment: userProfile?.time_commitment || '',
        capital_level: userProfile?.capital_level || '',
        completion_percentage: userProfile?.completion_percentage || 0,
        created_at: userProfile?.created_at || basicProfile?.created_at,
        updated_at: userProfile?.updated_at || basicProfile?.updated_at
      }

      return mergedProfile
    } catch (error) {
      console.error('Error getting complete profile:', error)
      throw error
    }
  }

  /**
   * Update user profile with intelligent field routing
   */
  static async updateProfile(userId: string, updates: Partial<CompleteProfile>): Promise<CompleteProfile> {
    try {
      // Separate updates for different tables
      const userProfileUpdates: any = {}
      const basicProfileUpdates: any = {}

      // Route fields to correct tables
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'name':
            // Update in both tables for consistency
            basicProfileUpdates.name = value
            userProfileUpdates.name = value
            break
          case 'username':
          case 'bio':
          case 'profile_picture_url':
          case 'profile_visibility':
          case 'contact_preferences':
          case 'notification_preferences':
          case 'email_verified':
          case 'language':
          case 'region':
          case 'stealth_mode':
          case 'sdg_goals':
          case 'low_tech_access':
          case 'business_type':
          case 'time_commitment':
          case 'capital_level':
          case 'completion_percentage':
            userProfileUpdates[key] = value
            break
          default:
            userProfileUpdates[key] = value
        }
      })

      // Update basic profile if needed
      if (Object.keys(basicProfileUpdates).length > 0) {
        const { error: basicError } = await supabase
          .from('profiles')
          .update(basicProfileUpdates)
          .eq('id', userId)

        if (basicError) throw basicError
      }

      // Update user profile (with upsert to handle missing records)
      if (Object.keys(userProfileUpdates).length > 0) {
        const { error: userProfileError } = await supabase
          .from('user_profiles')
          .upsert({ id: userId, ...userProfileUpdates })

        if (userProfileError) throw userProfileError
      }

      // Return updated profile
      const updatedProfile = await this.getCompleteProfile(userId)
      if (!updatedProfile) {
        throw new Error('Failed to retrieve updated profile')
      }

      return updatedProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateCompletion(profile: CompleteProfile): number {
    const requiredFields = [
      'name',
      'region',
      'business_type',
      'time_commitment',
      'capital_level'
    ]

    const optionalFields = [
      'username',
      'bio',
      'language'
    ]

    const completedRequired = requiredFields.filter(field => {
      const value = profile[field as keyof CompleteProfile]
      return value && value !== ''
    }).length

    const completedOptional = optionalFields.filter(field => {
      const value = profile[field as keyof CompleteProfile]
      return value && value !== ''
    }).length

    // Required fields are worth 80%, optional are worth 20%
    const requiredPercentage = (completedRequired / requiredFields.length) * 80
    const optionalPercentage = (completedOptional / optionalFields.length) * 20

    return Math.round(requiredPercentage + optionalPercentage)
  }

  /**
   * Check if username is available
   */
  static async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    if (!username || username.length < 3) return false

    try {
      let query = supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .limit(1)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error
      return data.length === 0
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }

  /**
   * Auto-save profile changes (for real-time updates)
   */
  static async autoSave(userId: string, updates: Partial<CompleteProfile>): Promise<void> {
    try {
      // Only save to user_profiles table for auto-save
      const userProfileUpdates: any = {}
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          userProfileUpdates[key] = value
        }
      })

      if (Object.keys(userProfileUpdates).length > 0) {
        await supabase
          .from('user_profiles')
          .upsert({ id: userId, ...userProfileUpdates })
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Don't throw error for auto-save failures
    }
  }
}