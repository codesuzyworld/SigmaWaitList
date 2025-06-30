import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { useUserProfile } from '../../hooks/useUserProfile'
import { MatrixBackground } from '../../components/MatrixBackground'
import { ProfileDashboard } from '../../components/profile'
import { ProfileSetup } from '../../components/profile'
import { AutomationDashboard } from '../../components/automation'
import { Navbar } from '../../components/Navbar'
import { ChatBox } from '../../components/ChatBox'
import { 
  CheckCircle, 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertTriangle,
  Cpu,
  Shield,
  Database,
  Settings,
  User
} from 'lucide-react'

export const AppDashboard: React.FC = () => {
  const { user } = useApp()
  const { profile, loading: profileLoading } = useUserProfile()
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'profile' | 'automation'>('dashboard')

  // Remove profile completion restriction - users can access app regardless
  const isProfileComplete = profile && (profile.completion_percentage || 0) >= 80
  // Allow access to app even with incomplete profile
  const shouldShowProfileSetup = false

  // Convert profile to BusinessProfile format for automation
  const businessProfile = profile ? {
    id: profile.id,
    user_id: user?.id || '',
    business_name: profile.name || '',
    business_type: profile.business_type || '',
    industry: profile.business_type || '',
    description: `${profile.business_type} business` || '',
    target_market: '',
    budget_range: profile.capital_level || '',
    timeline: profile.time_commitment || '',
    legal_structure: 'LLC' as const,
    state_of_incorporation: profile.region || ''
  } : undefined

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Enhanced Navbar */}
      <Navbar onNavigate={(section) => {
        if (section === 'profile' || section === 'profile-settings') setCurrentView('profile')
        if (section === 'dashboard') setCurrentView('dashboard')
        if (section === 'automation') setCurrentView('automation')
      }} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pt-20">
        {currentView === 'profile' ? (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-[#6ad040] hover:text-[#79e74c] font-['Space_Mono'] text-sm transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <ProfileDashboard />
          </div>
        ) : currentView === 'automation' ? (
          <AutomationDashboard businessProfile={businessProfile} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Command Center Header */}
            <div className="text-center mb-8">
              <h1 className="font-['Orbitron'] font-black text-[#ffff] text-3xl lg:text-5xl mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                SIGMA COMMAND CENTER
              </h1>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-base mb-6 opacity-90">
                Mission Control for AI Business Automation
              </p>
            </div>

            {/* Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* System Status */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">SYSTEM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs">ONLINE</span>
                </div>
              </div>

              {/* Profile Status */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">PROFILE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                      style={{ width: `${profile?.completion_percentage || 0}%` }}
                    />
                  </div>
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    {profile?.completion_percentage || 0}%
                  </span>
                </div>
              </div>

              {/* Active Modules */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">MODULES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">1/7</span>
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs">ACTIVE</span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-[#6ad040]/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#6ad040]" />
                  <span className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">ACTIVITY</span>
                </div>
                <div className="font-['Space_Mono'] text-[#b7ffab] text-xs">
                  Profile Updated
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Mission Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Mission Control Panel */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-[#6ad040]" />
                    <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                      MISSION STATUS
                    </h2>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={() => setCurrentView('profile')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20' 
                          : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {isProfileComplete ? (
                          <CheckCircle className="w-5 h-5 text-[#6ad040]" />
                        ) : (
                          <User className="w-5 h-5 text-blue-400" />
                        )}
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          {isProfileComplete ? 'PROFILE COMPLETE' : 'SETUP PROFILE'}
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        {isProfileComplete 
                          ? 'Profile setup complete - click to manage' 
                          : 'Complete your profile for enhanced features'
                        }
                      </p>
                    </button>

                    <button 
                      onClick={() => setCurrentView('automation')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                        isProfileComplete 
                          ? 'border-[#6ad040] bg-[#6ad040]/10 hover:bg-[#6ad040]/20' 
                          : 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className={`w-5 h-5 ${isProfileComplete ? 'text-[#6ad040]' : 'text-yellow-500'}`} />
                        <span className="font-['Space_Grotesk'] font-bold text-sm">
                          START AUTOMATION
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-xs opacity-80">
                        {isProfileComplete 
                          ? 'Begin your business automation journey'
                          : 'Complete profile to unlock AI features'
                        }
                      </p>
                    </button>
                  </div>

                  {/* Progress Overview */}
                  <div className="border-t border-[#6ad040]/20 pt-4">
                    <h3 className="font-['Space_Grotesk'] text-[#b7ffab] font-bold mb-4">AUTOMATION PIPELINE</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Profile Setup', completed: isProfileComplete, current: !isProfileComplete },
                        { name: 'AI Onboarding', completed: false, current: isProfileComplete },
                        { name: 'Business Formation', completed: false, current: false },
                        { name: 'Brand Development', completed: false, current: false },
                        { name: 'Digital Presence', completed: false, current: false },
                      ].map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            step.completed ? 'bg-[#6ad040]' : 
                            step.current ? 'bg-yellow-500 animate-pulse' : 
                            'bg-gray-600'
                          }`} />
                          <span className={`font-['Space_Mono'] text-sm ${
                            step.completed ? 'text-[#6ad040]' : 
                            step.current ? 'text-yellow-500' : 
                            'text-[#b7ffab]/60'
                          }`}>
                            {step.name}
                          </span>
                          {step.current && (
                            <span className="font-['Space_Mono'] text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - System Info */}
              <div className="space-y-6">
                {/* User Info Panel */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-[#6ad040]" />
                    <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                      SIGMA PROFILE
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Codename:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-['Space_Mono'] text-[#6ad040] text-sm font-bold">
                          {profile?.name || 'SIGMA_USER'}
                        </span>
                        <button
                          onClick={() => setCurrentView('profile')}
                          className="text-[#6ad040] hover:text-[#79e74c] transition-colors"
                          title="Profile Dashboard"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Region:</span>
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {profile?.region || 'Classified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Business Type:</span>
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {profile?.business_type || 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">Stealth Mode:</span>
                      <span className={`font-['Space_Mono'] text-sm ${
                        profile?.stealth_mode ? 'text-[#6ad040]' : 'text-[#b7ffab]/60'
                      }`}>
                        {profile?.stealth_mode ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Analytics */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#6ad040]" />
                    <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                      ANALYTICS
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-['Orbitron'] font-black text-[#6ad040] mb-1">
                        0
                      </div>
                      <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                        BUSINESSES AUTOMATED
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-['Orbitron'] font-bold text-[#6ad040]">
                          24/7
                        </div>
                        <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          AI UPTIME
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-['Orbitron'] font-bold text-[#6ad040]">
                          100%
                        </div>
                        <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          SIGMA ENERGY
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Modules */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-[#6ad040]" />
                <h2 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  AUTOMATION MODULES
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Business Setup', status: isProfileComplete ? 'Ready' : 'Complete Profile First', icon: '⚖️', ready: isProfileComplete },
                  { name: 'Brand Identity', status: 'Ready', icon: '🎨', ready: isProfileComplete },
                  { name: 'Website Builder', status: 'Ready', icon: '🌐', ready: isProfileComplete },
                  { name: 'Payment Setup', status: 'Ready', icon: '💳', ready: isProfileComplete },
                  { name: 'Business Banking', status: 'Ready', icon: '🏦', ready: isProfileComplete },
                  { name: 'Marketing AI', status: 'Ready', icon: '📈', ready: isProfileComplete },
                ].map((module, index) => (
                  <div
                    key={index}
                    onClick={() => module.ready && setCurrentView('automation')}
                    className={`bg-black/20 backdrop-blur-md rounded-xl border p-4 transition-all duration-300 text-center ${
                      module.ready 
                        ? 'border-[#6ad040] shadow-lg shadow-[#6ad040]/20 hover:scale-105 cursor-pointer' 
                        : 'border-[#6ad040]/40 hover:border-[#6ad040] hover:shadow-lg hover:shadow-[#6ad040]/20'
                    }`}
                  >
                    <div className="text-3xl mb-2">{module.icon}</div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-1">
                      {module.name}
                    </h3>
                    <p className={`font-['Space_Mono'] text-xs ${
                      module.ready ? 'text-[#6ad040] font-bold' : 'text-[#6ad040]'
                    }`}>
                      {module.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Status */}
            <div className="mt-8 text-center">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 max-w-3xl mx-auto">
                <h3 className="font-['Orbitron'] font-bold text-[#6ad040] text-xl mb-4">
                  ⚡ SIGMA AUTOMATION STATUS ⚡
                </h3>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm leading-relaxed opacity-90 mb-4">
                  The full AI Business Partner platform is now operational. Each module provides complete automation 
                  with cutting-edge AI capabilities and the same Matrix aesthetic. Complete your profile to unlock 
                  all automation modules and begin your journey to CEO status.
                </p>
                <div className="inline-flex items-center gap-2 bg-[#6ad040]/20 rounded-full px-4 py-2 border border-[#6ad040]/50">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                    FULL AUTOMATION SUITE ACTIVE
                  </span>
                </div>
              </div>
            </div>
        </div>
        )}
      </main>

      {/* Sigma AI Chatbox */}
      <ChatBox />
    </div>
  )
}