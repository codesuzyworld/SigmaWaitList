import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { useProfileSettings } from '../../hooks/useProfileSettings'
import { useApp } from '../../contexts/AppContext'
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Camera, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Upload, 
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export const ProfileSettings: React.FC = () => {
  const { user } = useApp()
  const { 
    profile, 
    loading, 
    error, 
    saving, 
    updateProfile, 
    checkUsernameAvailability,
    uploadProfilePicture,
    deleteProfilePicture,
    changePassword,
    autoSave
  } = useProfileSettings()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    profile_visibility: 'public' as 'public' | 'private' | 'friends',
    contact_preferences: {
      email: true,
      phone: false,
      marketing: false
    },
    notification_preferences: {
      email: true,
      push: true,
      in_app: true,
      marketing: false
    }
  })

  // UI state
  const [activeSection, setActiveSection] = useState<'personal' | 'account' | 'privacy' | 'notifications'>('personal')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        profile_visibility: profile.profile_visibility || 'public',
        contact_preferences: profile.contact_preferences || {
          email: true,
          phone: false,
          marketing: false
        },
        notification_preferences: profile.notification_preferences || {
          email: true,
          push: true,
          in_app: true,
          marketing: false
        }
      })
    }
  }, [profile])

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Auto-save functionality
  const handleAutoSave = (updates: Partial<typeof formData>) => {
    setAutoSaveStatus('saving')
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await autoSave(updates)
        setAutoSaveStatus('saved')
        
        setTimeout(() => {
          setAutoSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setAutoSaveStatus('idle')
      }
    }, 1000)
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    const updates = { [field]: value }
    setFormData(prev => ({ ...prev, ...updates }))
    handleAutoSave(updates)
  }

  // Handle nested object changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    const updates = {
      [parent]: {
        ...formData[parent as keyof typeof formData],
        [field]: value
      }
    }
    setFormData(prev => ({ ...prev, ...updates }))
    handleAutoSave(updates)
  }

  // Username availability check
  const handleUsernameChange = async (username: string) => {
    setFormData(prev => ({ ...prev, username }))
    
    if (username.length >= 3) {
      setUsernameChecking(true)
      const available = await checkUsernameAvailability(username)
      setUsernameAvailable(available)
      setUsernameChecking(false)
      
      if (available) {
        handleAutoSave({ username })
      }
    } else {
      setUsernameAvailable(null)
    }
  }

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
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

    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a']
    return {
      score,
      feedback,
      color: colors[score] || colors[0]
    }
  }

  const passwordStrength = checkPasswordStrength(newPassword)

  // Handle profile picture upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const result = await uploadProfilePicture(file)
    
    if (result.error) {
      setSuccessMessage('')
      // Error handling would show in the error state from the hook
    } else {
      setSuccessMessage('Profile picture updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    
    setUploadingImage(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle profile picture deletion
  const handleDeleteImage = async () => {
    const result = await deleteProfilePicture()
    
    if (result.error) {
      setSuccessMessage('')
    } else {
      setSuccessMessage('Profile picture removed successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      return
    }

    if (passwordStrength.score < 3) {
      return
    }

    const result = await changePassword(newPassword)
    
    if (result.error) {
      setSuccessMessage('')
    } else {
      setSuccessMessage('Password changed successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  // Handle manual save
  const handleSave = async () => {
    const { error } = await updateProfile(formData)
    
    if (!error) {
      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#6ad040] animate-spin mx-auto mb-4" />
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">Loading profile settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl mb-2 drop-shadow-lg drop-shadow-[#6ad040]/50">
          PROFILE SETTINGS
        </h2>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
          Manage your account settings and preferences
        </p>
        
        {/* Auto-save status */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {autoSaveStatus === 'saving' && (
            <>
              <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin" />
              <span className="font-['Space_Mono'] text-[#6ad040] text-xs">Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <CheckCircle className="w-4 h-4 text-[#6ad040]" />
              <span className="font-['Space_Mono'] text-[#6ad040] text-xs">Auto-saved</span>
            </>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-['Space_Mono'] text-green-400 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="font-['Space_Mono'] text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-2">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'account', label: 'Account', icon: Settings },
          { id: 'privacy', label: 'Privacy', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Space_Grotesk'] font-bold text-sm transition-all duration-300 ${
              activeSection === id
                ? 'bg-[#6ad040] text-[#161616]'
                : 'text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-[#6ad040]" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                    Personal Information
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#6ad040]/50 bg-black/40">
                        {profile?.profile_picture_url ? (
                          <img
                            src={profile.profile_picture_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-[#6ad040]" />
                          </div>
                        )}
                      </div>
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-[#6ad040] animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50 text-xs px-3 py-1"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                      
                      {profile?.profile_picture_url && (
                        <Button
                          onClick={handleDeleteImage}
                          disabled={uploadingImage}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-xs px-3 py-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                      Display Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your display name"
                      className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-black/20 border-[#6ad040]/30 text-[#b7ffab]/60 cursor-not-allowed"
                    />
                    <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          handleInputChange('bio', e.target.value)
                        }
                      }}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
                    />
                    <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          {activeSection === 'account' && (
            <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-5 h-5 text-[#6ad040]" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                    Account Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Choose a unique username"
                        className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameChecking && (
                          <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin" />
                        )}
                        {!usernameChecking && usernameAvailable === true && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {!usernameChecking && usernameAvailable === false && (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {formData.username.length >= 3 && (
                      <p className={`font-['Space_Mono'] text-xs mt-1 ${
                        usernameAvailable === false ? 'text-red-400' : 
                        usernameAvailable === true ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {usernameAvailable === false ? 'Username is already taken' :
                         usernameAvailable === true ? 'Username is available' :
                         'Checking availability...'}
                      </p>
                    )}
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-[#6ad040]/20 pt-6">
                    <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">
                      Change Password
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b7ffab] hover:text-[#6ad040]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded ${
                                    i < passwordStrength.score ? 'bg-current' : 'bg-gray-600'
                                  }`}
                                  style={{ color: passwordStrength.color }}
                                />
                              ))}
                            </div>
                            {passwordStrength.feedback.length > 0 && (
                              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                                Missing: {passwordStrength.feedback.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="font-['Space_Mono'] text-red-400 text-xs mt-1">
                            Passwords do not match
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={handlePasswordChange}
                        disabled={
                          !newPassword || 
                          !confirmPassword || 
                          newPassword !== confirmPassword || 
                          passwordStrength.score < 3 ||
                          saving
                        }
                        className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-[#6ad040]" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                    Privacy Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-3">
                      Profile Visibility
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                        { value: 'friends', label: 'Friends Only', desc: 'Only your connections can see your profile' },
                        { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                      ].map(({ value, label, desc }) => (
                        <div
                          key={value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            formData.profile_visibility === value
                              ? 'border-[#6ad040] bg-[#6ad040]/10'
                              : 'border-[#6ad040]/30 hover:border-[#6ad040]/50'
                          }`}
                          onClick={() => handleInputChange('profile_visibility', value)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              formData.profile_visibility === value
                                ? 'border-[#6ad040] bg-[#6ad040]'
                                : 'border-[#6ad040]/50'
                            }`}>
                              {formData.profile_visibility === value && (
                                <div className="w-full h-full rounded-full bg-[#161616] scale-50" />
                              )}
                            </div>
                            <div>
                              <p className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                                {label}
                              </p>
                              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                                {desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Preferences */}
                  <div className="border-t border-[#6ad040]/20 pt-6">
                    <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">
                      Contact Preferences
                    </h4>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Allow email contact', desc: 'Others can contact you via email' },
                        { key: 'phone', label: 'Allow phone contact', desc: 'Others can contact you via phone' },
                        { key: 'marketing', label: 'Marketing communications', desc: 'Receive marketing emails and updates' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                          <div>
                            <p className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                              {label}
                            </p>
                            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                              {desc}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNestedChange('contact_preferences', key, !formData.contact_preferences[key as keyof typeof formData.contact_preferences])}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              formData.contact_preferences[key as keyof typeof formData.contact_preferences] ? 'bg-[#6ad040]' : 'bg-black/50'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                formData.contact_preferences[key as keyof typeof formData.contact_preferences] ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Preferences */}
          {activeSection === 'notifications' && (
            <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-[#6ad040]" />
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                    Notification Preferences
                  </h3>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                    { key: 'in_app', label: 'In-App Notifications', desc: 'Show notifications within the app' },
                    { key: 'marketing', label: 'Marketing Notifications', desc: 'Receive promotional content and updates' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
                      <div>
                        <p className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                          {label}
                        </p>
                        <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          {desc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNestedChange('notification_preferences', key, !formData.notification_preferences[key as keyof typeof formData.notification_preferences])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.notification_preferences[key as keyof typeof formData.notification_preferences] ? 'bg-[#6ad040]' : 'bg-black/50'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            formData.notification_preferences[key as keyof typeof formData.notification_preferences] ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-black/40 hover:bg-black/60 text-[#b7ffab] border border-[#6ad040]/50 font-['Space_Grotesk'] font-bold"
                >
                  Reset Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-4">
                Account Info
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-['Space_Mono'] text-[#b7ffab]/70">Member Since:</span>
                  <span className="font-['Space_Mono'] text-[#6ad040]">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Space_Mono'] text-[#b7ffab]/70">Profile Complete:</span>
                  <span className="font-['Space_Mono'] text-[#6ad040]">
                    {profile?.completion_percentage || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Space_Mono'] text-[#b7ffab]/70">Email Verified:</span>
                  <span className={`font-['Space_Mono'] ${profile?.email_verified ? 'text-[#6ad040]' : 'text-yellow-500'}`}>
                    {profile?.email_verified ? 'Yes' : 'Pending'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}