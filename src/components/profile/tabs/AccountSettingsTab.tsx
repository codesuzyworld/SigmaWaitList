import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { useProfileSettings } from '../../../hooks/useProfileSettings'
import { useApp } from '../../../contexts/AppContext'
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  Key,
  Smartphone,
  Mail,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const AccountSettingsTab: React.FC = () => {
  const { user, signOut } = useApp()
  const { profile, loading, updateProfile, changePassword } = useProfileSettings()
  
  const [formData, setFormData] = useState({
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const getPasswordStrength = (password: string) => {
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
      color: colors[score] || colors[0],
      isStrong: score >= 4
    }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await updateProfile(formData)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Account settings saved successfully!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (!passwordStrength.isStrong) {
      setMessage({ type: 'error', text: 'Password is too weak. Please use a stronger password.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setChangingPassword(true)
    setMessage(null)

    try {
      const { error } = await changePassword(passwordData.newPassword)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setChangingPassword(false)
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    )
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This is your final warning. Deleting your account will permanently remove all data, profiles, and access. Type "DELETE" to confirm.'
      )
      
      if (doubleConfirmed) {
        // For now, just sign out - implement actual deletion later
        alert('Account deletion feature coming soon. For now, please contact support.')
      }
    }
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
      {/* Profile Visibility */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Profile Visibility
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
              { value: 'friends', label: 'Connections Only', desc: 'Only your connections can see your profile' },
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
        </CardContent>
      </Card>

      {/* Contact Preferences */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Contact Preferences
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Contact', desc: 'Allow others to contact you via email' },
              { key: 'phone', label: 'Phone Contact', desc: 'Allow others to contact you via phone' },
              { key: 'marketing', label: 'Marketing Communications', desc: 'Receive promotional emails and updates' }
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
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-4">
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

      {/* Security Settings */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Security Settings
            </h3>
          </div>

          {/* Change Password */}
          <div className="space-y-4">
            <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">
              Change Password
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Password */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b7ffab] hover:text-[#6ad040]"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
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

              {/* Confirm Password */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b7ffab] hover:text-[#6ad040]"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="font-['Space_Mono'] text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={
                !passwordData.newPassword || 
                !passwordData.confirmPassword || 
                passwordData.newPassword !== passwordData.confirmPassword || 
                !passwordStrength.isStrong ||
                changingPassword
              }
              className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>

          {/* Account Security Info */}
          <div className="mt-6 pt-6 border-t border-[#6ad040]/20">
            <h4 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">
              Account Security
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#6ad040]" />
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                    Email: {user?.email}
                  </span>
                </div>
                <span className="font-['Space_Mono'] text-[#6ad040] text-xs">Verified</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-yellow-500" />
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                    Two-Factor Authentication
                  </span>
                </div>
                <span className="font-['Space_Mono'] text-yellow-500 text-xs">Not Enabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Data & Privacy
            </h3>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50 font-['Space_Grotesk'] font-bold justify-start"
              onClick={() => alert('Data export feature coming soon!')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>

            <Button
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-['Space_Grotesk'] font-bold justify-start"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
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
          onClick={handleSaveSettings}
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
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}