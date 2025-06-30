import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { businessAutomation, type BusinessProfile, type LegalDocument } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  Scale, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building,
  Shield,
  Gavel
} from 'lucide-react'

interface LegalModuleProps {
  businessProfile?: BusinessProfile
  onComplete?: (documents: LegalDocument[]) => void
}

export const LegalModule: React.FC<LegalModuleProps> = ({ businessProfile, onComplete }) => {
  const { user } = useApp()
  const [profile, setProfile] = useState<BusinessProfile>(businessProfile || {
    user_id: user?.id || '',
    business_name: '',
    legal_structure: 'LLC',
    state_of_incorporation: '',
    description: ''
  })
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'setup' | 'generating' | 'review'>('setup')

  const legalStructures = [
    { value: 'LLC', label: 'Limited Liability Company (LLC)', description: 'Flexible structure with liability protection' },
    { value: 'Corporation', label: 'Corporation', description: 'Formal structure for larger businesses' },
    { value: 'Partnership', label: 'Partnership', description: 'For businesses with multiple owners' },
    { value: 'Sole Proprietorship', label: 'Sole Proprietorship', description: 'Simplest structure for individual owners' }
  ]

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ]

  const handleGenerateDocuments = async () => {
    if (!profile.business_name || !profile.legal_structure || !profile.state_of_incorporation) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    setStep('generating')

    try {
      const generatedDocs = await businessAutomation.generateLegalDocuments(profile)
      setDocuments(generatedDocs)
      setStep('review')
      
      trackEvent('legal_documents_generated', {
        business_name: profile.business_name,
        legal_structure: profile.legal_structure,
        state: profile.state_of_incorporation,
        document_count: generatedDocs.length
      })

      if (onComplete) {
        onComplete(generatedDocs)
      }
    } catch (error) {
      console.error('Error generating legal documents:', error)
      alert('Failed to generate legal documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = (document: LegalDocument) => {
    const blob = new Blob([document.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${document.document_type.replace(/_/g, '-')}-${profile.business_name?.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent('legal_document_downloaded', {
      document_type: document.document_type,
      business_name: profile.business_name
    })
  }

  if (step === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-[#6ad040]" />
            <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
              LEGAL AUTOMATION
            </h2>
          </div>
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
            Boring but necessary. Sigma will handle all your legal paperwork automatically.
          </p>
        </div>

        {/* Business Information Form */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Name *
                </label>
                <Input
                  value={profile.business_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Enter your business name"
                  className="bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60"
                />
              </div>

              {/* Legal Structure */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Legal Structure *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {legalStructures.map((structure) => (
                    <div
                      key={structure.value}
                      onClick={() => setProfile(prev => ({ ...prev, legal_structure: structure.value as any }))}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        profile.legal_structure === structure.value
                          ? 'border-[#6ad040] bg-[#6ad040]/10'
                          : 'border-[#6ad040]/30 hover:border-[#6ad040]/60'
                      }`}
                    >
                      <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-1">
                        {structure.label}
                      </h3>
                      <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                        {structure.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* State of Incorporation */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  State of Incorporation *
                </label>
                <select
                  value={profile.state_of_incorporation}
                  onChange={(e) => setProfile(prev => ({ ...prev, state_of_incorporation: e.target.value }))}
                  className="w-full h-10 px-3 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] focus:border-[#6ad040] focus:outline-none"
                >
                  <option value="">Select a state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Business Description */}
              <div>
                <label className="block font-['Space_Mono'] text-[#b7ffab] text-sm mb-2">
                  Business Description
                </label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your business does"
                  rows={3}
                  className="w-full px-3 py-2 bg-black/40 border-2 border-[#6ad040]/50 rounded-lg text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleGenerateDocuments}
                disabled={!profile.business_name || !profile.legal_structure || !profile.state_of_incorporation}
                className="font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Gavel className="w-5 h-5 mr-2" />
                Generate Legal Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8">
            <Loader2 className="w-16 h-16 text-[#6ad040] animate-spin mx-auto mb-6" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              GENERATING LEGAL DOCUMENTS
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Sigma is creating your legal paperwork. This may take a few moments...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            LEGAL DOCUMENTS READY
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Your legal documents have been generated. Review and download them below.
        </p>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((document, index) => (
          <Card key={index} className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-[#6ad040]" />
                    <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-lg">
                      {document.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-['Space_Mono'] ${
                      document.status === 'ready' ? 'bg-[#6ad040]/20 text-[#6ad040]' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {document.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {document.filing_instructions && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-['Space_Mono'] text-blue-400 text-xs font-bold mb-1">
                            FILING INSTRUCTIONS
                          </p>
                          <p className="font-['Space_Mono'] text-blue-300 text-xs">
                            {document.filing_instructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                    Document preview: {document.content.slice(0, 150)}...
                  </p>
                </div>
                
                <Button
                  onClick={() => downloadDocument(document)}
                  className="ml-4 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-5 h-5 text-[#6ad040]" />
            <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-lg">
              Next Steps
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                1
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Review all documents carefully and consult with a legal professional if needed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                2
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                File required documents with the appropriate state agencies
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                3
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Obtain your EIN from the IRS using the generated application
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                4
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Set up your business banking account with the required documents
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}