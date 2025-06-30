import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useApp } from '../../contexts/AppContext'
import { 
  User, 
  Settings, 
  Shield, 
  FileText,
  Briefcase,
  Globe,
  Lock,
  Bell,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { PersonalProfileTab } from './tabs/PersonalProfileTab'
import { BusinessProfileTab } from './tabs/BusinessProfileTab'
import { LegalComplianceTab } from './tabs/LegalComplianceTab'
import { AccountSettingsTab } from './tabs/AccountSettingsTab'

interface ProfileDashboardProps {
  onNavigate?: (view: string) => void
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onNavigate }) => {
  const { user } = useApp()
  const { profile, loading } = useUserProfile()
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'legal' | 'account'>('personal')

  const tabs = [
    {
      id: 'personal' as const,
      label: 'Personal Info',
      icon: User,
      description: 'Basic profile information'
    },
    {
      id: 'business' as const,
      label: 'Business Profile',
      icon: Briefcase,
      description: 'Business details and preferences'
    },
    {
      id: 'legal' as const,
      label: 'Legal & Compliance',
      icon: FileText,
      description: 'Legal information and compliance'
    },
    {
      id: 'account' as const,
      label: 'Account Settings',
      icon: Settings,
      description: 'Security and preferences'
    }
  ]

  const getCompletionStats = () => {
    if (!profile) return { total: 0, completed: 0, percentage: 0 }

    const fields = {
      personal: ['name', 'region', 'language'],
      business: ['business_type', 'time_commitment', 'capital_level'],
      legal: [], // Will add legal fields
      account: ['username']
    }

    let total = 0
    let completed = 0

    Object.values(fields).forEach(fieldList => {
      fieldList.forEach(field => {
        total++
        const value = profile[field as keyof typeof profile]
        if (value && value !== '') completed++
      })
    })

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  const stats = getCompletionStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6ad040] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-[#6ad040] hover:text-[#79e74c] font-['Space_Mono'] text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
            )}
          </div>
          <h1 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl mb-2 drop-shadow-lg drop-shadow-[#6ad040]/50">
            SIGMA PROFILE CENTER
          </h1>
          <p className="font-['Space_Mono'] text-[#b7ffab] text-sm opacity-90">
            Manage your profile, business information, and account settings
          </p>
        </div>

        {/* Profile Completion Status */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              {stats.percentage >= 80 ? (
                <CheckCircle className="w-5 h-5 text-[#6ad040]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-['Space_Grotesk'] text-[#b7ffab] font-bold text-sm">
                Profile Completion
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <span className="font-['Space_Mono'] text-[#6ad040] text-sm font-bold">
                {stats.percentage}%
              </span>
            </div>
            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs mt-1">
              {stats.completed} of {stats.total} fields completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                isActive
                  ? 'border-[#6ad040] bg-[#6ad040]/10 shadow-lg shadow-[#6ad040]/20'
                  : 'border-[#6ad040]/40 bg-black/20 hover:border-[#6ad040]/60 hover:bg-[#6ad040]/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-[#6ad040]' : 'text-[#b7ffab]'
                }`} />
                <span className={`font-['Space_Grotesk'] font-bold text-sm ${
                  isActive ? 'text-[#6ad040]' : 'text-[#b7ffab]'
                }`}>
                  {tab.label}
                </span>
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                {tab.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'personal' && <PersonalProfileTab />}
        {activeTab === 'business' && <BusinessProfileTab />}
        {activeTab === 'legal' && <LegalComplianceTab />}
        {activeTab === 'account' && <AccountSettingsTab />}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#6ad040]/20 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-center sm:text-left">
            <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
              Profile completion unlocks advanced AI features and business automation tools
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setActiveTab('legal')}
              className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/50 font-['Space_Grotesk'] font-bold"
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Legal
            </Button>
            <Button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Space_Grotesk'] font-bold"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}