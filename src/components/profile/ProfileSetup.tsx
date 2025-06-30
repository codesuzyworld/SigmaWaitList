import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { CheckCircle, User, Globe, Briefcase, Clock, DollarSign, Shield, Loader2, Save, RefreshCw, Database, AlertTriangle, Wifi, WifiOff, FileText, Building } from 'lucide-react'

export const ProfileSetup: React.FC = () => {
  const { user } = useApp()
  const { profile, loading, updateProfile, loadProfile } = useUserProfile()
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    business_type: '',
    time_commitment: '',
    capital_level: '',
    stealth_mode: false,
    // Legal information
    legal_name: '',
    legal_jurisdiction: '',
    age_verification: false,
    terms_accepted: false,
    privacy_accepted: false,
    data_processing_consent: false,
    // Business details
    business_stage: '',
    target_market: '',
    revenue_goal: '',
    business_model: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [connectionError, setConnectionError] = useState('')

  // Check database connection on mount - simplified approach
  useEffect(() => {
    const checkConnection = async () => {
      if (user?.id) {
        try {
          setConnectionStatus('connecting')
          setConnectionError('')
          
          console.log('Testing database connection...')
          
          // Simplified connection test - just try to load the profile
          await loadProfile()
          
          // If we get here without error, connection is good
          setConnectionStatus('connected')
          console.log('Database connection established and profile loaded')
          
        } catch (error: any) {
          setConnectionStatus('error')
          setConnectionError(error.message || 'Connection failed')
          console.error('Database connection/profile load failed:', error)
        }
      } else {
        // No user, but that's not a connection error
        setConnectionStatus('connected')
      }
    }

    // Add a small delay to prevent flashing
    const timer = setTimeout(checkConnection, 500)
    return () => clearTimeout(timer)
  }, [user?.id])

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        region: profile.region || '',
        business_type: profile.business_type || '',
        time_commitment: profile.time_commitment || '',
        capital_level: profile.capital_level || '',
        stealth_mode: profile.stealth_mode || false,
        // Legal information
        legal_name: (profile as any).legal_name || '',
        legal_jurisdiction: (profile as any).legal_jurisdiction || '',
        age_verification: (profile as any).age_verification || false,
        terms_accepted: (profile as any).terms_accepted || false,
        privacy_accepted: (profile as any).privacy_accepted || false,
        data_processing_consent: (profile as any).data_processing_consent || false,
        // Business details
        business_stage: (profile as any).business_stage || '',
        target_market: (profile as any).target_market || '',
        revenue_goal: (profile as any).revenue_goal || '',
        business_model: (profile as any).business_model || ''
      })
    }
  }, [profile])

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = !!(
      formData.name.trim() &&
      formData.region &&
      formData.business_type &&
      formData.time_commitment &&
      formData.capital_level
    )
    setIsFormValid(isValid)
    console.log('Form validation:', { isValid, formData })
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      setSaveError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    try {
      console.log('Attempting to save profile:', formData)
      
      const { data, error } = await updateProfile(formData)
      
      if (error) {
        setSaveError(error)
        console.error('Profile save error:', error)
      } else {
        setSaveSuccess(true)
        console.log('Profile saved successfully:', data)
        
        // Track successful profile update
        trackEvent('profile_updated', {
          user_id: user?.id,
          completion_percentage: data?.completion_percentage || 0,
          has_business_type: !!formData.business_type,
          has_region: !!formData.region
        })
        
        // Hide success message after 5 seconds
        setTimeout(() => setSaveSuccess(false), 5000)
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile')
      console.error('Profile save exception:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('Form data updated:', { field, value, newData })
      return newData
    })
    // Clear any previous errors when user starts typing
    if (saveError) setSaveError('')
  }

  const handleRefresh = async () => {
    setSaving(true)
    setConnectionStatus('connecting')
    setConnectionError('')
    
    try {
      console.log('Refreshing connection and profile...')
      
      // Test connection and load profile
      await loadProfile()
      setConnectionStatus('connected')
      console.log('Profile refreshed successfully')
      
    } catch (error: any) {
      setConnectionStatus('error')
      setConnectionError(error.message || 'Refresh failed')
      console.error('Refresh failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const businessTypes = [
    'E-commerce',
    'SaaS/Software',
    'Consulting',
    'Content Creation',
    'Freelancing',
    'Physical Products',
    'Cryptocurrency/Blockchain',
    'Healthcare',
    'Finance',
    'Education',
    'Real Estate',
    'Food & Beverage',
    'Other'
  ]

  const timeCommitments = [
    'Part-time (10-20 hrs/week)',
    'Full-time (40+ hrs/week)', 
    'Weekend warrior (5-10 hrs/week)',
    'Flexible/Variable'
  ]

  const capitalLevels = [
    'Bootstrap ($0-1K)',
    'Self-funded ($1K-10K)',
    'Well-funded ($10K-50K)',
    'Heavily funded ($50K+)',
    'Seeking investment',
    'Already generating revenue'
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

  const businessStages = [
    'Idea stage',
    'Research & validation',
    'Building MVP',
    'Early customers',
    'Growing revenue',
    'Scaling operations',
    'Established business'
  ]

  const businessModels = [
    'B2B SaaS',
    'B2C Product',
    'Marketplace',
    'Subscription',
    'One-time purchase',
    'Service-based',
    'Advertising/Content',
    'Affiliate/Commission',
    'Licensing',
    'Other'
  ]

  const revenueGoals = [
    '$1K-5K/month',
    '$5K-10K/month',
    '$10K-25K/month',
    '$25K-50K/month',
    '$50K-100K/month',
    '$100K+/month',
    'Not revenue focused',
    'Exit/acquisition goal'
  ]

  const jurisdictions = [
    'United States',
    'Canada',
    'United Kingdom',
    'European Union',
    'Australia',
    'Other'
  ]

  const completionPercentage = profile?.completion_percentage || 0
  const isConnected = connectionStatus === 'connected'

  const getButtonText = () => {
    if (saving) return 'Saving Profile...'
    if (connectionStatus === 'connecting') return 'Connecting...'
    if (connectionStatus === 'error') return 'Connection Error - Click Refresh'
    if (!isFormValid) return 'Fill Required Fields'
    return 'Save Profile'
  }

  const getButtonIcon = () => {
    if (saving) return <Loader2 className="w-5 h-5 mr-2 animate-spin" />
    if (connectionStatus === 'connecting') return <Database className="w-5 h-5 mr-2" />
    if (connectionStatus === 'error') return <AlertTriangle className="w-5 h-5 mr-2" />
    return <Save className="w-5 h-5 mr-2" />
  }

  const getConnectionIcon = () => {
    if (connectionStatus === 'connected') return <Wifi className="w-4 h-4" />
    if (connectionStatus === 'error') return <WifiOff className="w-4 h-4" />
    return <Database className="w-4 h-4" />
  }

  const isLegallyCompliant = () => {
    return formData.terms_accepted && 
           formData.privacy_accepted && 
           formData.age_verification &&
           formData.legal_name &&
           formData.legal_jurisdiction
  }

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#6ad040] animate-spin mx-auto mb-4" />
            <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">Loading profile setup...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-lg p-6 text-center">
          <p className="font-['Space_Mono'] text-red-400 text-sm mb-4">Error loading profile: {error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl drop-shadow-lg drop-shadow-[#6ad040]/50">
            SIGMA PROFILE SETUP
          </h2>
          <Button
            onClick={handleRefresh}
            disabled={saving}
            className="p-2 h-auto bg-transparent hover:bg-[#6ad040]/20 text-[#6ad040] border border-[#6ad040]/50"
            title="Refresh connection"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
          Configure your business automation preferences
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-4 bg-black/30 backdrop-blur-md rounded-full p-1 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[#b7ffab] px-4 py-2">
            <span>Progress</span>
            <span className="text-[#6ad040] font-bold">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border ${
          connectionStatus === 'connected' 
            ? 'bg-green-500/10 border-green-500/30' 
            : connectionStatus === 'error'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-black/30 border-[#6ad040]/30'
        }`}>
          {getConnectionIcon()}
          <span className={`font-['Space_Mono'] text-xs ${
            connectionStatus === 'connected' 
              ? 'text-green-400' 
              : connectionStatus === 'error'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {connectionStatus === 'connected' 
              ? 'Database Connected' 
              : connectionStatus === 'error'
              ? `Connection Error: ${connectionError}`
              : 'Connecting to Database...'
            }
          </span>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-['Space_Mono'] text-green-400 text-sm font-bold">
                Profile saved successfully!
              </p>
              <p className="font-['Space_Mono'] text-green-300 text-xs">
                Your automation preferences have been updated and synced to the database. Completion: {completionPercentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-['Space_Mono'] text-red-400 text-sm font-bold">
                Save failed
              </p>
              <p className="font-['Space_Mono'] text-red-300 text-xs">
                {saveError}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Basic Information
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Name (or Business Name) *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your sigma name..."
                  className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                />
              </div>

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
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Business Profile
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Time Commitment *
                </label>
                <select
                  value={formData.time_commitment}
                  onChange={(e) => handleInputChange('time_commitment', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">How much time can you dedicate?</option>
                  {timeCommitments.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Capital Level *
                </label>
                <select
                  value={formData.capital_level}
                  onChange={(e) => handleInputChange('capital_level', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Available capital?</option>
                  {capitalLevels.map(capital => (
                    <option key={capital} value={capital}>{capital}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Stage
                </label>
                <select
                  value={formData.business_stage}
                  onChange={(e) => handleInputChange('business_stage', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Where are you in your journey?</option>
                  {businessStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Model
                </label>
                <select
                  value={formData.business_model}
                  onChange={(e) => handleInputChange('business_model', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">How do you plan to make money?</option>
                  {businessModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Target Market
                </label>
                <Input
                  type="text"
                  value={formData.target_market}
                  onChange={(e) => handleInputChange('target_market', e.target.value)}
                  placeholder="Who are your customers?"
                  className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                />
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Revenue Goal
                </label>
                <select
                  value={formData.revenue_goal}
                  onChange={(e) => handleInputChange('revenue_goal', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">What's your target monthly revenue?</option>
                  {revenueGoals.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance */}
        <Card className={`backdrop-blur-md border rounded-2xl ${
          isLegallyCompliant() 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {isLegallyCompliant() ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <h3 className="font-['Orbitron'] font-bold text-lg">
                {isLegallyCompliant() ? 'Legal Compliance: Complete' : 'Legal Compliance Required'}
              </h3>
            </div>
            
            <p className="font-['Space_Mono'] text-sm opacity-90 mb-6">
              {isLegallyCompliant() 
                ? 'Your legal information is complete and compliant with our terms of service.'
                : 'Please complete the required legal information below to ensure compliance.'
              }
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-['Space_Mono'] text-sm mb-2">
                  Full Legal Name *
                </label>
                <Input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => handleInputChange('legal_name', e.target.value)}
                  placeholder="Your full legal name"
                  className="bg-black/40 border-[#6ad040]/50 placeholder:text-[#b7ffab]/60"
                />
                <p className="font-['Space_Mono'] text-xs mt-1 opacity-60">
                  Must match government-issued ID
                </p>
              </div>

              <div>
                <label className="block font-['Space_Mono'] text-sm mb-2">
                  Legal Jurisdiction *
                </label>
                <select
                  value={formData.legal_jurisdiction}
                  onChange={(e) => handleInputChange('legal_jurisdiction', e.target.value)}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Select your jurisdiction</option>
                  {jurisdictions.map(jurisdiction => (
                    <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                  ))}
                </select>
              </div>

              {/* Legal Agreements */}
              <div className="space-y-3 pt-4 border-t border-[#6ad040]/20">
                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.age_verification}
                    onChange={(e) => handleInputChange('age_verification', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
                  />
                  <div>
                    <p className="font-['Space_Grotesk'] text-sm font-bold">
                      Age Verification *
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-70">
                      I confirm that I am at least 18 years old (or the age of majority in my jurisdiction)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
                  />
                  <div>
                    <p className="font-['Space_Grotesk'] text-sm font-bold">
                      Terms of Service Agreement *
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-70">
                      I agree to the{' '}
                      <button className="text-[#6ad040] hover:text-[#79e74c] underline">
                        Terms of Service
                      </button>
                      {' '}and understand my rights and obligations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.privacy_accepted}
                    onChange={(e) => handleInputChange('privacy_accepted', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
                  />
                  <div>
                    <p className="font-['Space_Grotesk'] text-sm font-bold">
                      Privacy Policy Agreement *
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-70">
                      I acknowledge that I have read and agree to the{' '}
                      <button className="text-[#6ad040] hover:text-[#79e74c] underline">
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.data_processing_consent}
                    onChange={(e) => handleInputChange('data_processing_consent', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
                  />
                  <div>
                    <p className="font-['Space_Grotesk'] text-sm font-bold">
                      Data Processing Consent
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-70">
                      I consent to the processing of my personal data for business automation services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Privacy & Stealth Mode
              </h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <div>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm font-bold">
                  Stealth Mode
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Enhanced privacy features for anonymous business building
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('stealth_mode', !formData.stealth_mode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.stealth_mode ? 'bg-[#6ad040]' : 'bg-black/50'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.stealth_mode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={saving || !isFormValid}
          className="w-full font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>

        {/* Form Status */}
        <div className="text-center space-y-2">
          {!isFormValid && (
            <div className="text-xs font-['Space_Mono'] text-yellow-400">
              Required: Name, Region, Business Type, Time Commitment, Capital Level
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="text-xs font-['Space_Mono'] text-red-400">
              Database connection failed. Click refresh to retry or check your internet connection.
            </div>
          )}

          {isFormValid && connectionStatus === 'connected' && (
            <div className="text-xs font-['Space_Mono'] text-green-400">
              Ready to save! All required fields completed.
            </div>
          )}
        </div>
      </form>
    </div>
  )
}