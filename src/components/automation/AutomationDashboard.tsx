import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useApp } from '../../contexts/AppContext'
import { LegalModule } from './LegalModule'
import { BrandingModule } from './BrandingModule'
import { WebsiteModule } from './WebsiteModule'
import { PaymentModule } from './PaymentModule'
import { MarketingModule } from './MarketingModule'
import { BankingModule } from './BankingModule'
import { type BusinessProfile, type LegalDocument, type BrandAsset, type WebsiteConfig, type PaymentSetup, type MarketingCampaign } from '../../lib/businessAutomation'
import { trackEvent } from '../../lib/analytics'
import { 
  Zap, 
  Scale, 
  Palette, 
  Globe, 
  CreditCard, 
  TrendingUp, 
  Building2,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'

interface AutomationDashboardProps {
  businessProfile?: BusinessProfile
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ businessProfile }) => {
  const { user } = useApp()
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [moduleData, setModuleData] = useState<{
    legal?: LegalDocument[]
    branding?: BrandAsset[]
    website?: WebsiteConfig
    payment?: PaymentSetup
    marketing?: MarketingCampaign[]
    banking?: any
  }>({})

  const modules = [
    {
      id: 'legal',
      title: 'Legal Setup',
      description: 'Business registration, EIN, and legal documents',
      icon: Scale,
      color: '#6ad040',
      estimated_time: '30 minutes'
    },
    {
      id: 'branding',
      title: 'Brand Identity',
      description: 'Logo, colors, typography, and brand guidelines',
      icon: Palette,
      color: '#8b5cf6',
      estimated_time: '20 minutes'
    },
    {
      id: 'website',
      title: 'Website Creation',
      description: 'Professional website with SEO optimization',
      icon: Globe,
      color: '#3b82f6',
      estimated_time: '45 minutes'
    },
    {
      id: 'payment',
      title: 'Payment Processing',
      description: 'Stripe integration and payment methods',
      icon: CreditCard,
      color: '#10b981',
      estimated_time: '15 minutes'
    },
    {
      id: 'banking',
      title: 'Business Banking',
      description: 'Bank recommendations and account setup',
      icon: Building2,
      color: '#f59e0b',
      estimated_time: '25 minutes'
    },
    {
      id: 'marketing',
      title: 'Marketing Automation',
      description: 'Social media, email, and content campaigns',
      icon: TrendingUp,
      color: '#ef4444',
      estimated_time: '35 minutes'
    }
  ]

  const handleModuleComplete = (moduleId: string, data: any) => {
    setCompletedModules(prev => new Set([...prev, moduleId]))
    setModuleData(prev => ({ ...prev, [moduleId]: data }))
    setCurrentModule(null)
    
    trackEvent('automation_module_completed', {
      module_id: moduleId,
      business_name: businessProfile?.business_name
    })
  }

  const startFullAutomation = () => {
    if (!businessProfile) return
    
    // Start with legal module
    setCurrentModule('legal')
    
    trackEvent('full_automation_started', {
      business_name: businessProfile.business_name,
      module_count: modules.length
    })
  }

  const getNextModule = () => {
    const incompleteModules = modules.filter(m => !completedModules.has(m.id))
    return incompleteModules[0]?.id || null
  }

  const totalEstimatedTime = modules.reduce((total, module) => {
    const time = parseInt(module.estimated_time)
    return total + time
  }, 0)

  const completionPercentage = Math.round((completedModules.size / modules.length) * 100)

  if (currentModule) {
    const moduleProps = {
      businessProfile,
      onComplete: (data: any) => handleModuleComplete(currentModule, data)
    }

    switch (currentModule) {
      case 'legal':
        return <LegalModule {...moduleProps} />
      case 'branding':
        return <BrandingModule {...moduleProps} />
      case 'website':
        return <WebsiteModule {...moduleProps} brandAssets={moduleData.branding} />
      case 'payment':
        return <PaymentModule {...moduleProps} />
      case 'marketing':
        return <MarketingModule {...moduleProps} brandAssets={moduleData.branding} />
      case 'banking':
        return <BankingModule {...moduleProps} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            BUSINESS AUTOMATION CENTER
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90 mb-4">
          Complete business setup automation. From 0 to CEO while you sleep.
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm font-['Space_Mono'] text-[#b7ffab] mb-2">
            <span>Progress</span>
            <span className="text-[#6ad040] font-bold">{completionPercentage}%</span>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[#b7ffab]/60 mt-1">
            <span>{completedModules.size} of {modules.length} modules</span>
            <span>~{totalEstimatedTime} min total</span>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      {completedModules.size === 0 && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              Ready to Automate Your Business?
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm mb-6 max-w-2xl mx-auto">
              Sigma will handle everything from legal paperwork to marketing campaigns. 
              Sit back and watch your business come to life automatically.
            </p>
            <Button
              onClick={startFullAutomation}
              className="font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Full Automation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          const isCompleted = completedModules.has(module.id)
          const isNext = getNextModule() === module.id
          
          return (
            <Card 
              key={module.id} 
              className={`bg-black/30 backdrop-blur-md border rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                isCompleted 
                  ? 'border-[#6ad040] shadow-lg shadow-[#6ad040]/20' 
                  : isNext
                  ? 'border-yellow-500/60 shadow-lg shadow-yellow-500/20'
                  : 'border-[#6ad040]/40 hover:border-[#6ad040] hover:shadow-lg hover:shadow-[#6ad040]/20'
              }`}
              onClick={() => setCurrentModule(module.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${module.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                  
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-[#6ad040]" />
                  ) : isNext ? (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[#161616]" />
                    </div>
                  ) : (
                    <Clock className="w-6 h-6 text-[#b7ffab]/40" />
                  )}
                </div>

                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                  {module.title}
                </h3>
                
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm mb-4">
                  {module.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    ~{module.estimated_time}
                  </span>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-['Space_Mono'] font-bold ${
                    isCompleted 
                      ? 'bg-[#6ad040]/20 text-[#6ad040]' 
                      : isNext
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-[#b7ffab]/20 text-[#b7ffab]/60'
                  }`}>
                    {isCompleted ? 'COMPLETE' : isNext ? 'NEXT' : 'PENDING'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Summary */}
      {completedModules.size > 0 && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Automation Progress
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(completedModules).map(moduleId => {
                const module = modules.find(m => m.id === moduleId)
                if (!module) return null
                
                const Icon = module.icon
                
                return (
                  <div key={moduleId} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#6ad040]" />
                      <div>
                        <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">
                          {module.title}
                        </h4>
                        <p className="font-['Space_Mono'] text-[#6ad040] text-xs">
                          Completed
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {completedModules.size === modules.length && (
              <div className="mt-6 p-4 bg-[#6ad040]/10 border border-[#6ad040]/30 rounded-lg text-center">
                <h4 className="font-['Orbitron'] font-bold text-[#6ad040] text-lg mb-2">
                  🎉 AUTOMATION COMPLETE!
                </h4>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                  Your business is now fully automated and ready to scale. Welcome to the sigma lifestyle!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}