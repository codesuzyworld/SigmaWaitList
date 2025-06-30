import React, { useState } from 'react'
import { Button } from './ui/button'
import { useApp } from '../contexts/AppContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { trackEvent, trackSectionView } from '../lib/analytics'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Home,
  Zap,
  CheckCircle
} from 'lucide-react'

interface NavbarProps {
  onNavigate?: (section: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, appMode, setAppMode, signOut } = useApp()
  const { profile } = useUserProfile()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleBackToWaitlist = () => {
    setAppMode({ isAppMode: false, hasAccess: true })
    setShowUserMenu(false)
  }

  const handleEnterApp = () => {
    setAppMode({ isAppMode: true, hasAccess: true })
    trackEvent('enter_app_click', { location: 'navbar' })
    setShowUserMenu(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    setShowMobileMenu(false)
  }

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    } else {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
    }
    trackSectionView(section)
    setShowMobileMenu(false)
  }

  const getUserDisplayName = () => {
    if (profile?.name) return profile.name
    if (user?.email) return user.email.split('@')[0]
    return 'Sigma'
  }

  const completionPercentage = profile?.completion_percentage || 0

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-black/60 backdrop-blur-md border-b border-[#6ad040]/20 shadow-lg shadow-[#6ad040]/10 z-50">
      <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="w-20 h-6 sm:w-28 sm:h-8 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            if (user) {
              // If user is logged in, logo always goes to app
              if (!appMode.isAppMode) {
                handleEnterApp()
              }
              // If already in app, stay in app (could scroll to top of dashboard)
            } else {
              // If not logged in, scroll to top of waitlist page
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        />
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {!appMode.isAppMode && (
            <nav className="flex items-center gap-6">
              <button
                onClick={() => handleNavigation('feature')}
                className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation('tech')}
                className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
              >
                Tech
              </button>
              <button
                onClick={() => handleNavigation('team')}
                className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
              >
                Team
              </button>
            </nav>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              {/* User Info & Menu */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/40 hover:border-[#6ad040] transition-all duration-300 hover:shadow-lg hover:shadow-[#6ad040]/30"
              >
                {/* User Avatar/Icon */}
                <div className="w-8 h-8 bg-[#6ad040] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#161616]" />
                </div>
                
                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <div className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold">
                    {getUserDisplayName()}
                  </div>
                  {profile && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#6ad040]" />
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs">
                        {completionPercentage}% Complete
                      </span>
                    </div>
                  )}
                </div>

                <ChevronDown className={`w-4 h-4 text-[#b7ffab] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 py-2 z-50">
                  <div className="px-4 py-3 border-b border-[#6ad040]/20">
                    <div className="font-['Space_Grotesk'] text-[#b7ffab] font-bold">
                      {getUserDisplayName()}
                    </div>
                    <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                      {user.email}
                    </div>
                    {profile && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs font-['Space_Mono'] text-[#b7ffab] mb-1">
                          <span>Profile Complete</span>
                          <span className="text-[#6ad040] font-bold">{completionPercentage}%</span>
                        </div>
                        <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {appMode.isAppMode ? (
                      <button
                        onClick={handleBackToWaitlist}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 transition-all duration-200 font-['Space_Mono'] text-sm"
                      >
                        <Home className="w-4 h-4" />
                        Back to Waitlist
                      </button>
                    ) : (
                      <button
                        onClick={handleEnterApp}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 text-[#6ad040] hover:text-[#79e74c] hover:bg-[#6ad040]/10 transition-all duration-200 font-['Space_Mono'] text-sm font-bold"
                      >
                        <Zap className="w-4 h-4" />
                        Enter App
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (appMode.isAppMode) {
                          // Navigate to profile settings
                          if (onNavigate) {
                            onNavigate('profile-settings')
                          }
                          setShowUserMenu(false)
                        } else {
                          handleEnterApp()
                        }
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 transition-all duration-200 font-['Space_Mono'] text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </button>

                    <hr className="my-2 border-[#6ad040]/20" />

                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 font-['Space_Mono'] text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => handleNavigation('waitlist')}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_6px_rgba(106,208,64,0.5)] border border-[#6ad040]/30 active:scale-95"
              >
                Join Waitlist
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[#b7ffab] hover:text-[#6ad040] transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-black/95 backdrop-blur-md border-t border-[#6ad040]/20">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {!appMode.isAppMode && (
              <>
                <button
                  onClick={() => handleNavigation('feature')}
                  className="block w-full text-left px-4 py-2 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm"
                >
                  Features
                </button>
                <button
                  onClick={() => handleNavigation('tech')}
                  className="block w-full text-left px-4 py-2 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm"
                >
                  Tech Stack
                </button>
                <button
                  onClick={() => handleNavigation('team')}
                  className="block w-full text-left px-4 py-2 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm"
                >
                  Team
                </button>
                <hr className="border-[#6ad040]/20" />
              </>
            )}

            {user ? (
              <>
                {appMode.isAppMode ? (
                  <button
                    onClick={handleBackToWaitlist}
                    className="flex items-center gap-3 w-full px-4 py-2 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm"
                  >
                    <Home className="w-4 h-4" />
                    Back to Waitlist
                  </button>
                ) : (
                  <button
                    onClick={handleEnterApp}
                    className="flex items-center gap-3 w-full px-4 py-2 text-[#6ad040] hover:text-[#79e74c] hover:bg-[#6ad040]/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm font-bold"
                  >
                    <Zap className="w-4 h-4" />
                    Enter App
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 font-['Space_Mono'] text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('waitlist')}
                className="w-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm px-4 py-3 rounded-full transition-all duration-300 active:scale-95"
              >
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click Outside Handler */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </header>
  )
}