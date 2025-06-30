import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { mistralAI, type MistralMessage, type BusinessIntent } from '../lib/mistral'
import { useApp } from '../contexts/AppContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { trackEvent } from '../lib/analytics'
import { 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  X,
  Zap,
  Loader2,
  Sparkles,
  Settings,
  FileText,
  Database
} from 'lucide-react'

interface ChatMessage extends MistralMessage {
  id: string
  timestamp: Date
  intent?: BusinessIntent
}

interface ChatBoxProps {
  className?: string
}

export const ChatBox: React.FC<ChatBoxProps> = ({ className = '' }) => {
  const { user, setAppMode, appMode } = useApp()
  const { profile, createBusinessProfile } = useUserProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey there, future CEO! I'm Sigma AI, your business automation partner. What's your vision? I can help you start a business, handle legal paperwork, create branding, build websites, set up payments, or automate marketing. Let's turn your ideas into reality! 💪",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Track chat interaction with profile context
    trackEvent('chat_interaction', {
      message_type: 'user_message',
      message_length: inputValue.length,
      user_authenticated: !!user,
      has_profile: !!profile,
      profile_completion: profile?.completion_percentage || 0
    })

    try {
      // Analyze intent
      const intent = mistralAI.analyzeIntent(inputValue)
      
      // Get AI response with profile context
      const contextualMessages = [
        ...messages.slice(-5), // Keep last 5 messages for context
        userMessage
      ]

      // Add profile context to the conversation if available
      if (profile && profile.completion_percentage && profile.completion_percentage > 0) {
        const businessProfile = createBusinessProfile()
        const profileContext = `User Profile Context: Name: ${profile.name || 'Not set'}, Business Type: ${profile.business_type || 'Not set'}, Region: ${profile.region || 'Not set'}, Time Commitment: ${profile.time_commitment || 'Not set'}, Capital Level: ${profile.capital_level || 'Not set'}, Completion: ${profile.completion_percentage}%. Business Profile: ${JSON.stringify(businessProfile)}`
        
        contextualMessages.unshift({
          id: 'context',
          role: 'system',
          content: profileContext,
          timestamp: new Date()
        })
      }
      
      const aiResponse = await mistralAI.chat(contextualMessages)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        intent
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track AI response and intent
      trackEvent('chat_ai_response', {
        intent_type: intent.type,
        intent_confidence: intent.confidence,
        response_length: aiResponse.length,
        profile_completion: profile?.completion_percentage || 0
      })

      // Auto-trigger actions based on high-confidence intents
      if (intent.confidence > 0.8 && user) {
        handleIntentAction(intent)
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. But hey, that's what makes us stronger! Try asking me again, and let's get your business automated! 💪",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleIntentAction = (intent: BusinessIntent) => {
    switch (intent.action) {
      case 'complete_profile_setup':
        if (user && !appMode.isAppMode) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: 'enter_app_profile' })
        }
        break
      case 'start_onboarding_process':
        if (user) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: 'enter_app' })
        }
        break
      case 'start_legal_setup':
      case 'start_branding_process':
      case 'start_website_builder':
      case 'setup_payment_processing':
      case 'setup_business_banking':
      case 'start_marketing_automation':
        if (user) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: intent.action })
        }
        break
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getProfileCompletionStatus = () => {
    if (!profile) return { percentage: 0, message: 'Profile not created', ready: false }
    
    const completion = profile.completion_percentage || 0
    if (completion < 50) return { percentage: completion, message: 'Profile incomplete', ready: false }
    if (completion < 80) return { percentage: completion, message: 'Almost ready', ready: false }
    return { percentage: completion, message: 'Profile complete', ready: true }
  }

  const profileStatus = getProfileCompletionStatus()

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] shadow-2xl hover:shadow-[#6ad040]/50 transition-all duration-300 hover:scale-110 group"
        >
          <div className="relative">
            <Bot className="w-8 h-8" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#161616] animate-pulse" />
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`bg-black/90 backdrop-blur-md border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#6ad040]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6ad040] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#161616]" />
              </div>
              <div>
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-sm">
                  SIGMA AI
                </h3>
                <p className="font-['Space_Mono'] text-[#6ad040] text-xs">
                  Business Automation Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-[#b7ffab] hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* User Status Bar */}
              {user && (
                <div className="px-4 py-2 bg-black/40 border-b border-[#6ad040]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">
                        {profile?.name || 'Sigma User'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-[#6ad040]" />
                        <span className="font-['Space_Mono'] text-[#6ad040] text-xs">
                          DB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Settings className="w-3 h-3 text-[#6ad040]" />
                        <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                          {profileStatus.percentage}%
                        </span>
                      </div>
                      {profileStatus.ready && (
                        <Button
                          onClick={() => setAppMode({ isAppMode: true, hasAccess: true })}
                          className="text-xs px-2 py-1 h-auto bg-[#6ad040] hover:bg-[#79e74c] text-[#161616]"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Automate
                        </Button>
                      )}
                    </div>
                  </div>
                  {!profileStatus.ready && (
                    <div className="mt-1">
                      <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                          style={{ width: `${profileStatus.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-[#6ad040] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-[#161616]" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-[#6ad040] text-[#161616] rounded-br-md'
                            : 'bg-black/40 border border-[#6ad040]/30 text-[#b7ffab] rounded-bl-md'
                        }`}
                      >
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          message.role === 'user' 
                            ? 'font-["Space_Mono"]' 
                            : 'font-["Space_Mono"]'
                        }`}>
                          {message.content}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-1 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.intent && message.intent.confidence > 0.8 && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#6ad040]" />
                            <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                              {message.intent.type.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-[#b7ffab] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-[#161616]" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-[#6ad040] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-[#161616]" />
                    </div>
                    <div className="bg-black/40 border border-[#6ad040]/30 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin" />
                        <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                          Sigma is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {user && !profileStatus.ready && (
                <div className="px-4 py-2 border-t border-[#6ad040]/20">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setInputValue("Help me complete my profile")
                        handleSendMessage()
                      }}
                      className="text-xs px-3 py-1 h-auto bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Complete Profile
                    </Button>
                    <Button
                      onClick={() => {
                        setInputValue("What can you automate for my business?")
                        handleSendMessage()
                      }}
                      className="text-xs px-3 py-1 h-auto bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Show Features
                    </Button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-[#6ad040]/20">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Sigma anything about your business..."
                    disabled={isLoading}
                    className="flex-1 bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:ring-[#6ad040]/30"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {!user && (
                  <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-2 text-center">
                    Sign up to unlock full automation features
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}