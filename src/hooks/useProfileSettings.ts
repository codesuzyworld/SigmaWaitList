import { useState, useEffect } from 'react'
import { OptimizedProfileService } from '../lib/api/optimizedProfileService'
import { useApp } from '../contexts/AppContext'
import type { CompleteProfile } from '../lib/api/profileService'

// Use CompleteProfile from optimized service
export type ProfileSettings = CompleteProfile

export const useProfileSettings = () => {
  const { user } = useApp()
  const [profile, setProfile] = useState<CompleteProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Update user profile using optimized service
  const updateProfile = async (updates: Partial<CompleteProfile>) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    setSaving(true)
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
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Check username availability using optimized service
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    return await OptimizedProfileService.checkUsernameAvailability(username, user?.id)
  }

  // Upload profile picture (simplified for now)
  const uploadProfilePicture = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user?.id) return { error: 'User not authenticated' }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { error: 'Please select an image file' }
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: 'Image size must be less than 5MB' }
      }

      // For now, return a placeholder message
      // TODO: Implement actual file upload to Supabase Storage
      return { error: 'Profile picture upload coming soon!' }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err)
      return { error: err.message }
    }
  }

  // Delete profile picture
  const deleteProfilePicture = async (): Promise<{ error?: string }> => {
    try {
      await updateProfile({ profile_picture_url: null })
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Change password
  const changePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Auto-save functionality using optimized service
  const autoSave = async (updates: Partial<CompleteProfile>) => {
    if (!user?.id) return

    try {
      await OptimizedProfileService.autoSave(user.id, updates)
      
      // Update local state for immediate feedback
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    } else {
      setLoading(false)
      setProfile(null)
    }
  }, [user?.id])

  return {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    loadProfile,
    checkUsernameAvailability,
    uploadProfilePicture,
    deleteProfilePicture,
    changePassword,
    autoSave
  }
}