import { useState, useEffect } from 'react'
import { OptimizedProfileService } from '../lib/api/optimizedProfileService'
import { useApp } from '../contexts/AppContext'
import type { CompleteProfile } from '../lib/api/profileService'

// Use CompleteProfile from optimized service
export type UserProfile = CompleteProfile

export const useUserProfile = () => {
  const { user } = useApp()
  const [profile, setProfile] = useState<CompleteProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test database connection - simplified and more reliable
  const testConnection = async () => {
    try {
      console.log('Testing database connection...')
      
      // Simple connection test - just try to access the table
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Connection test failed:', error)
        return { connected: false, error: error.message }
      }

      console.log('Database connection test passed')
      return { connected: true, error: null }
    } catch (err: any) {
      console.error('Connection test exception:', err)
      return { connected: false, error: err.message || 'Connection failed' }
    }
  }

  // Load user profile using optimized service
  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false)
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const profileData = await OptimizedProfileService.getCompleteProfile(user.id)
      setProfile(profileData)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading user profile:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // Update user profile using optimized service
  const updateProfile = async (updates: Partial<CompleteProfile>) => {
    if (!user?.id) return { data: null, error: 'No user found' }

    setLoading(true)
    setError(null)

    try {
      const updatedProfile = await OptimizedProfileService.updateProfile(user.id, updates)
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        return { data: updatedProfile, error: null }
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating user profile:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Calculate completion percentage
  const calculateCompletion = (profileData: CompleteProfile) => {
    const fields = [
      'name',
      'region', 
      'business_type',
      'time_commitment',
      'capital_level'
    ]
    
    const completed = fields.filter(field => 
      profileData[field as keyof CompleteProfile] && 
      profileData[field as keyof CompleteProfile] !== ''
    ).length

    return Math.round((completed / fields.length) * 100)
  }

  // Update completion percentage
  const updateCompletion = async () => {
    if (!profile) return

    const completion = calculateCompletion(profile)
    if (completion !== profile.completion_percentage) {
      await updateProfile({ completion_percentage: completion })
    }
  }

  // Create business profile from user profile
  const createBusinessProfile = () => {
    if (!profile || !user?.id) return null

    return {
      id: profile.id,
      user_id: user.id,
      business_name: profile.name || '',
      business_type: profile.business_type || '',
      industry: profile.business_type || '',
      description: `${profile.business_type} business` || '',
      target_market: '',
      budget_range: profile.capital_level || '',
      timeline: profile.time_commitment || '',
      legal_structure: 'LLC' as const,
      state_of_incorporation: profile.region || ''
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  useEffect(() => {
    if (profile) {
      updateCompletion()
    }
  }, [profile?.name, profile?.region, profile?.business_type, profile?.time_commitment, profile?.capital_level])

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile,
    calculateCompletion,
    createBusinessProfile,
    testConnection
  }
}