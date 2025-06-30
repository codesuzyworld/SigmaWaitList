import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { useApp } from '../../../contexts/AppContext'
import { 
  User, 
  Globe, 
  Camera, 
  Upload, 
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const PersonalProfileTab: React.FC = () => {
  const { user } = useApp()
  const { profile, loading, updateProfile } = useUserProfile()
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    region: '',
    language: 'en',
    profile_picture_url: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Languages and regions
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ]

  const regions = [
    'North America',
    'South America', 
    'Europe',
    'Asia-Pacific',
    'Middle East',
    'Africa',
    'Oceania',
    'Other'
  ]

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        region: profile.region || '',
        language: profile.language || 'en',
        profile_picture_url: profile.profile_picture_url || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await updateProfile(formData)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Personal information saved successfully!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save changes' })
    } finally {
      setSaving(false)
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#6ad040] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Profile Picture
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Display */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#6ad040]/50 bg-black/40">
                {formData.profile_picture_url ? (
                  <img
                    src={formData.profile_picture_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-[#6ad040]" />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <Button
                  className="bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50"
                  onClick={() => {
                    // Placeholder for file upload
                    setMessage({ type: 'error', text: 'Profile picture upload coming soon!' })
                    setTimeout(() => setMessage(null), 3000)
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                
                {formData.profile_picture_url && (
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                    onClick={() => handleInputChange('profile_picture_url', '')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                Recommended: Square image, at least 200x200px, max 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Name */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Display Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name or alias"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Username
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                placeholder="unique_username"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                Lowercase letters, numbers, and underscores only
              </p>
            </div>

            {/* Email (Read-only) */}
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

            {/* Region */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
              >
                <option value="">Select your region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
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
              placeholder="Tell us about yourself, your goals, and what drives you..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
            />
            <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Language */}
          <div className="mt-6">
            <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
              Preferred Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full md:w-1/2 h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-['Space_Mono'] text-sm">{message.text}</p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}