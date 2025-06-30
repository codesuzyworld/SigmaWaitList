import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { businessAutomation, type BusinessProfile } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  Building2, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  FileText,
  Shield,
  CreditCard,
  Star
} from 'lucide-react'

interface BankingModuleProps {
  businessProfile?: BusinessProfile
  onComplete?: (setup: any) => void
}

export const BankingModule: React.FC<BankingModuleProps> = ({ businessProfile, onComplete }) => {
  const { user } = useApp()
  const [bankingSetup, setBankingSetup] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generating' | 'review'>('generating')

  useEffect(() => {
    if (businessProfile) {
      generateBankingSetup()
    }
  }, [businessProfile])

  const generateBankingSetup = async () => {
    if (!businessProfile) return

    setLoading(true)
    try {
      const setup = await businessAutomation.generateBankingSetup(businessProfile)
      setBankingSetup(setup)
      setStep('review')
      
      trackEvent('banking_setup_generated', {
        business_name: businessProfile.business_name,
        bank_count: setup.recommended_banks.length
      })

      if (onComplete) {
        onComplete(setup)
      }
    } catch (error) {
      console.error('Error generating banking setup:', error)
      alert('Failed to generate banking setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8">
            <Loader2 className="w-16 h-16 text-[#6ad040] animate-spin mx-auto mb-6" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              SETTING UP BUSINESS BANKING
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Skip the bank small talk and get your business running...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bankingSetup) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            BUSINESS BANKING SETUP
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Skip the bank small talk and get your business running with the right banking partner.
        </p>
      </div>

      {/* Recommended Banks */}
      <div className="space-y-4">
        <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
          Recommended Banks
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bankingSetup.recommended_banks.map((bank: any, index: number) => (
            <Card key={index} className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#6ad040]" />
                    <h4 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                      {bank.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-[#6ad040] fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pros */}
                  <div>
                    <h5 className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm mb-2">Pros</h5>
                    <ul className="space-y-1">
                      {bank.pros.map((pro: string, proIndex: number) => (
                        <li key={proIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-[#6ad040] mt-1 flex-shrink-0" />
                          <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <h5 className="font-['Space_Grotesk'] font-bold text-red-400 text-sm mb-2">Cons</h5>
                    <ul className="space-y-1">
                      {bank.cons.map((con: string, conIndex: number) => (
                        <li key={conIndex} className="flex items-start gap-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full mt-1 flex-shrink-0" />
                          <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best For */}
                  <div className="bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                    <h5 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-1">Best For:</h5>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-xs">{bank.bestFor}</p>
                  </div>

                  <Button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(bank.name + ' business banking')}`, '_blank')}
                    className="w-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] py-2 rounded-lg transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Required Documents */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
              Required Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankingSetup.required_documents.map((document: string, index: number) => (
              <div key={index} className="flex items-center gap-3 bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                <CheckCircle className="w-4 h-4 text-[#6ad040]" />
                <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{document}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-['Space_Mono'] text-blue-400 text-xs font-bold mb-1">
                  IMPORTANT NOTE
                </p>
                <p className="font-['Space_Mono'] text-blue-300 text-xs">
                  Ensure all documents are official copies. Some banks may require notarized documents for business accounts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Types */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
              Recommended Account Types
            </h3>
          </div>

          <div className="space-y-4">
            {bankingSetup.account_types.map((account: any, index: number) => (
              <div key={index} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">
                    {account.type}
                  </h4>
                  <div className="flex gap-2">
                    {account.required && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                        REQUIRED
                      </span>
                    )}
                    {account.recommended && (
                      <span className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs font-bold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
                  {account.description}
                </p>
                {account.recommendedIf && (
                  <p className="font-['Space_Mono'] text-[#6ad040] text-xs mt-2">
                    Recommended for: {account.recommendedIf}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Checklist */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
              Banking Setup Checklist
            </h3>
          </div>

          <div className="space-y-3">
            {bankingSetup.setup_checklist.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
              Banking Best Practices
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm">Financial Management</h4>
              <ul className="space-y-2">
                {[
                  'Keep business and personal finances separate',
                  'Set up automatic transfers to savings',
                  'Monitor account activity regularly',
                  'Maintain minimum balance requirements'
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-[#6ad040] mt-1 flex-shrink-0" />
                    <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm">Security & Compliance</h4>
              <ul className="space-y-2">
                {[
                  'Enable two-factor authentication',
                  'Use strong, unique passwords',
                  'Review statements monthly',
                  'Keep business records organized'
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-[#6ad040] mt-1 flex-shrink-0" />
                    <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}