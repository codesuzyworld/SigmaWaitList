import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Target,
  Globe,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react'

export const BusinessProfileTab: React.FC = () => {
  const { profile, loading, updateProfile } = useUserProfile()
  
  const [formData, setFormData] = useState({
    business_type: '',
    time_commitment: '',
    capital_level: '',
    stealth_mode: false,
    sdg_goals: [] as string[],
    low_tech_access: false,
    business_stage: '',
    target_market: '',
    revenue_goal: '',
    business_model: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Business data options
  const businessTypes = [
    'E-commerce',
    'SaaS/Software',
    'Consulting/Services',
    'Content Creation',
    'Freelancing',
    'Physical Products',
    'Real Estate',
    'Finance/Investment',
    'Healthcare',
    'Education',
    'Food & Beverage',
    'Retail',
    'Manufacturing',
    'Other'
  ]

  const timeCommitments = [
    'Part-time (10-20 hrs/week)',
    'Full-time (40+ hrs/week)', 
    'Weekend warrior (5-10 hrs/week)',
    'Flexible/Variable',
    'Seeking to scale down current work',
    'This will be my main focus'
  ]

  const capitalLevels = [
    'Bootstrap ($0-1K)',
    'Self-funded ($1K-10K)',
    'Well-funded ($10K-50K)',
    'Heavily funded ($50K+)',
    'Seeking investment',
    'Already generating revenue'
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

  const sdgGoals = [
    'No Poverty',
    'Zero Hunger', 
    'Good Health and Well-being',
    'Quality Education',
    'Gender Equality',
    'Clean Water and Sanitation',
    'Affordable and Clean Energy',
    'Decent Work and Economic Growth',
    'Industry, Innovation and Infrastructure',
    'Reduced Inequality',
    'Sustainable Cities and Communities',
    'Responsible Consumption and Production',
    'Climate Action',
    'Life Below Water',
    'Life on Land',
    'Peace and Justice',
    'Partnerships to Achieve the Goal'
  ]

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        business_type: profile.business_type || '',
        time_commitment: profile.time_commitment || '',
        capital_level: profile.capital_level || '',
        stealth_mode: profile.stealth_mode || false,
        sdg_goals: profile.sdg_goals || [],
        low_tech_access: profile.low_tech_access || false,
        business_stage: (profile as any).business_stage || '',
        target_market: (profile as any).target_market || '',
        revenue_goal: (profile as any).revenue_goal || '',
        business_model: (profile as any).business_model || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSDGToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      sdg_goals: prev.sdg_goals.includes(goal)
        ? prev.sdg_goals.filter(g => g !== goal)
        : [...prev.sdg_goals, goal]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await updateProfile(formData)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Business profile saved successfully!' })
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
      {/* Business Basics */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Business Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Type */}
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

            {/* Business Stage */}
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

            {/* Business Model */}
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

            {/* Target Market */}
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
          </div>
        </CardContent>
      </Card>

      {/* Commitment & Resources */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Commitment & Resources
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Commitment */}
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

            {/* Capital Level */}
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

            {/* Revenue Goal */}
            <div className="md:col-span-2">
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

      {/* UN SDG Goals */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              UN Sustainable Development Goals
            </h3>
          </div>
          
          <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm mb-4">
            Select which UN SDGs align with your business mission (optional):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sdgGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => handleSDGToggle(goal)}
                className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                  formData.sdg_goals.includes(goal)
                    ? 'border-[#6ad040] bg-[#6ad040]/10 text-[#6ad040]'
                    : 'border-[#6ad040]/30 hover:border-[#6ad040]/50 text-[#b7ffab]'
                }`}
              >
                <span className="font-['Space_Mono'] text-xs">{goal}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Accessibility */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Privacy & Accessibility
            </h3>
          </div>

          <div className="space-y-4">
            {/* Stealth Mode */}
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Stealth Mode
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Enhanced privacy features for anonymous business building
                </p>
              </div>
              <button
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

            {/* Low Tech Access */}
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Low-Tech Access Mode
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Optimize interface for slower internet and older devices
                </p>
              </div>
              <button
                onClick={() => handleInputChange('low_tech_access', !formData.low_tech_access)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.low_tech_access ? 'bg-[#6ad040]' : 'bg-black/50'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.low_tech_access ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
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
              Save Business Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}