import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Save,
  Loader2
} from 'lucide-react'

export const LegalComplianceTab: React.FC = () => {
  const { profile, loading, updateProfile } = useUserProfile()
  
  const [formData, setFormData] = useState({
    legal_name: '',
    date_of_birth: '',
    tax_id: '',
    entity_type: '',
    business_address: '',
    phone_number: '',
    emergency_contact: '',
    terms_accepted: false,
    privacy_accepted: false,
    marketing_consent: false,
    data_processing_consent: false,
    age_verification: false,
    legal_jurisdiction: '',
    professional_license: '',
    insurance_info: ''
  })
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const entityTypes = [
    'Individual/Sole Proprietor',
    'LLC (Limited Liability Company)',
    'Corporation (C-Corp)',
    'S-Corporation', 
    'Partnership',
    'Non-Profit Organization',
    'Trust',
    'Other'
  ]

  const jurisdictions = [
    'United States',
    'Canada',
    'United Kingdom',
    'European Union',
    'Australia',
    'Other'
  ]

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        legal_name: (profile as any).legal_name || '',
        date_of_birth: (profile as any).date_of_birth || '',
        tax_id: (profile as any).tax_id || '',
        entity_type: (profile as any).entity_type || '',
        business_address: (profile as any).business_address || '',
        phone_number: (profile as any).phone_number || '',
        emergency_contact: (profile as any).emergency_contact || '',
        terms_accepted: (profile as any).terms_accepted || false,
        privacy_accepted: (profile as any).privacy_accepted || false,
        marketing_consent: profile.contact_preferences?.marketing || false,
        data_processing_consent: (profile as any).data_processing_consent || false,
        age_verification: (profile as any).age_verification || false,
        legal_jurisdiction: (profile as any).legal_jurisdiction || '',
        professional_license: (profile as any).professional_license || '',
        insurance_info: (profile as any).insurance_info || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Update contact preferences separately
      const contactPreferences = {
        ...profile?.contact_preferences,
        marketing: formData.marketing_consent
      }

      const updateData = {
        ...formData,
        contact_preferences: contactPreferences
      }

      const { error } = await updateProfile(updateData)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Legal information saved successfully!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save changes' })
    } finally {
      setSaving(false)
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const isLegallyCompliant = () => {
    return formData.terms_accepted && 
           formData.privacy_accepted && 
           formData.age_verification &&
           formData.legal_name &&
           formData.legal_jurisdiction
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
      {/* Legal Status Overview */}
      <Card className={`backdrop-blur-md border rounded-2xl ${
        isLegallyCompliant() 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {isLegallyCompliant() ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            )}
            <h3 className="font-['Orbitron'] font-bold text-lg">
              {isLegallyCompliant() ? 'Legal Compliance: Complete' : 'Legal Compliance: Incomplete'}
            </h3>
          </div>
          <p className="font-['Space_Mono'] text-sm opacity-90">
            {isLegallyCompliant() 
              ? 'Your legal information is complete and compliant with our terms of service.'
              : 'Please complete the required legal information below to ensure compliance.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Required Legal Information */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Required Legal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal Name */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Full Legal Name *
              </label>
              <Input
                type="text"
                value={formData.legal_name}
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                placeholder="Your full legal name"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                Must match government-issued ID
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab]"
              />
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                Required for age verification and compliance
              </p>
            </div>

            {/* Legal Jurisdiction */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Legal Jurisdiction *
              </label>
              <select
                value={formData.legal_jurisdiction}
                onChange={(e) => handleInputChange('legal_jurisdiction', e.target.value)}
                className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
              >
                <option value="">Select your jurisdiction</option>
                {jurisdictions.map(jurisdiction => (
                  <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Entity Information */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Business Entity Information
            </h3>
          </div>

          <div className="space-y-6">
            {/* Entity Type */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Entity Type
              </label>
              <select
                value={formData.entity_type}
                onChange={(e) => handleInputChange('entity_type', e.target.value)}
                className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
              >
                <option value="">Select entity type</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Tax ID */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Tax ID / EIN
              </label>
              <Input
                type="text"
                value={formData.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                placeholder="XX-XXXXXXX"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                For tax reporting and business verification
              </p>
            </div>

            {/* Business Address */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Business Address
              </label>
              <textarea
                value={formData.business_address}
                onChange={(e) => handleInputChange('business_address', e.target.value)}
                placeholder="Full business address including city, state, and zip"
                rows={3}
                className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
              />
            </div>

            {/* Professional License */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Professional License (if applicable)
              </label>
              <Input
                type="text"
                value={formData.professional_license}
                onChange={(e) => handleInputChange('professional_license', e.target.value)}
                placeholder="License number and issuing authority"
                className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
              />
            </div>

            {/* Insurance Information */}
            <div>
              <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                Business Insurance
              </label>
              <textarea
                value={formData.insurance_info}
                onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                placeholder="Insurance provider, policy number, coverage details"
                rows={2}
                className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Agreements & Consent */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Legal Agreements & Consent
            </h3>
          </div>

          <div className="space-y-4">
            {/* Age Verification */}
            <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <input
                type="checkbox"
                checked={formData.age_verification}
                onChange={(e) => handleInputChange('age_verification', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
              />
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Age Verification *
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  I confirm that I am at least 18 years old (or the age of majority in my jurisdiction)
                </p>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <input
                type="checkbox"
                checked={formData.terms_accepted}
                onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
              />
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Terms of Service Agreement *
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  I agree to the{' '}
                  <button className="text-[#6ad040] hover:text-[#79e74c] underline">
                    Terms of Service
                  </button>
                  {' '}and understand my rights and obligations
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <input
                type="checkbox"
                checked={formData.privacy_accepted}
                onChange={(e) => handleInputChange('privacy_accepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
              />
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Privacy Policy Agreement *
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  I acknowledge that I have read and agree to the{' '}
                  <button className="text-[#6ad040] hover:text-[#79e74c] underline">
                    Privacy Policy
                  </button>
                </p>
              </div>
            </div>

            {/* Data Processing Consent */}
            <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <input
                type="checkbox"
                checked={formData.data_processing_consent}
                onChange={(e) => handleInputChange('data_processing_consent', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
              />
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Data Processing Consent
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  I consent to the processing of my personal data for business automation services
                </p>
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[#6ad040]/20">
              <input
                type="checkbox"
                checked={formData.marketing_consent}
                onChange={(e) => handleInputChange('marketing_consent', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6ad040] bg-black border-[#6ad040] rounded focus:ring-[#6ad040]"
              />
              <div>
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Marketing Communications
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  I consent to receive marketing emails and promotional content
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
              Legal Documents
            </h3>
          </div>

          <div className="space-y-3">
            <button className="flex items-center justify-between w-full p-4 bg-black/20 rounded-lg border border-[#6ad040]/20 hover:border-[#6ad040]/40 transition-colors">
              <div className="text-left">
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Terms of Service
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Complete terms and conditions for using Sigma services
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6ad040]" />
            </button>

            <button className="flex items-center justify-between w-full p-4 bg-black/20 rounded-lg border border-[#6ad040]/20 hover:border-[#6ad040]/40 transition-colors">
              <div className="text-left">
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Privacy Policy
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  How we collect, use, and protect your personal information
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6ad040]" />
            </button>

            <button className="flex items-center justify-between w-full p-4 bg-black/20 rounded-lg border border-[#6ad040]/20 hover:border-[#6ad040]/40 transition-colors">
              <div className="text-left">
                <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                  Cookie Policy
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  Information about cookies and tracking technologies
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6ad040]" />
            </button>
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
              <AlertTriangle className="w-5 h-5" />
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
              Save Legal Information
            </>
          )}
        </Button>
      </div>
    </div>
  )
}