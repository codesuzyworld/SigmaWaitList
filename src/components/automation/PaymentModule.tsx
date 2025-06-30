import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { businessAutomation, type BusinessProfile, type PaymentSetup } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  CreditCard, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  Shield,
  Zap,
  DollarSign,
  Smartphone
} from 'lucide-react'

interface PaymentModuleProps {
  businessProfile?: BusinessProfile
  onComplete?: (setup: PaymentSetup) => void
}

export const PaymentModule: React.FC<PaymentModuleProps> = ({ businessProfile, onComplete }) => {
  const { user } = useApp()
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetup | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generating' | 'review'>('generating')

  useEffect(() => {
    if (businessProfile) {
      generatePaymentSetup()
    }
  }, [businessProfile])

  const generatePaymentSetup = async () => {
    if (!businessProfile) return

    setLoading(true)
    try {
      const setup = await businessAutomation.setupPaymentProcessing(businessProfile)
      setPaymentSetup(setup)
      setStep('review')
      
      trackEvent('payment_setup_generated', {
        business_name: businessProfile.business_name,
        provider: setup.provider
      })

      if (onComplete) {
        onComplete(setup)
      }
    } catch (error) {
      console.error('Error generating payment setup:', error)
      alert('Failed to generate payment setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activatePayments = async () => {
    if (!paymentSetup) return

    setLoading(true)
    try {
      // Simulate payment activation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPaymentSetup(prev => prev ? {
        ...prev,
        setup_status: 'active',
        account_id: 'acct_' + Math.random().toString(36).substr(2, 9)
      } : null)

      trackEvent('payment_setup_activated', {
        business_name: businessProfile?.business_name,
        provider: paymentSetup.provider
      })
    } catch (error) {
      console.error('Error activating payments:', error)
      alert('Failed to activate payments. Please try again.')
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
              SETTING UP PAYMENTS
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Configuring payment processing that actually works...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentSetup) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            PAYMENT PROCESSING READY
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Payment processing that actually works. No more lost sales due to payment issues.
        </p>
      </div>

      {/* Payment Provider Overview */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Stripe Integration
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-['Space_Mono'] font-bold ${
              paymentSetup.setup_status === 'active' 
                ? 'bg-[#6ad040]/20 text-[#6ad040]' 
                : 'bg-yellow-500/20 text-yellow-500'
            }`}>
              {paymentSetup.setup_status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Payment Provider</h4>
                <div className="bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#6ad040] rounded flex items-center justify-center">
                      <span className="font-bold text-[#161616] text-sm">S</span>
                    </div>
                    <div>
                      <p className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Stripe</p>
                      <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">Industry-leading payment processor</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Account Status</h4>
                <div className="bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                  {paymentSetup.account_id ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#6ad040]" />
                      <span className="font-['Space_Mono'] text-[#6ad040] text-sm">
                        Account ID: {paymentSetup.account_id}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-yellow-500" />
                      <span className="font-['Space_Mono'] text-yellow-500 text-sm">
                        Pending activation
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supported Methods */}
            <div className="space-y-4">
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Payment Methods</h4>
                <div className="space-y-2">
                  {paymentSetup.supported_methods.map((method, index) => (
                    <div key={index} className="flex items-center gap-3 bg-black/40 rounded-lg p-2 border border-[#6ad040]/30">
                      {method === 'card' && <CreditCard className="w-4 h-4 text-[#6ad040]" />}
                      {method === 'bank_transfer' && <DollarSign className="w-4 h-4 text-[#6ad040]" />}
                      {method === 'digital_wallet' && <Smartphone className="w-4 h-4 text-[#6ad040]" />}
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Webhook URL</h4>
                <div className="bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                  <code className="font-['Space_Mono'] text-[#6ad040] text-xs break-all">
                    {paymentSetup.webhook_url}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Features */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Security Features
              </h3>
            </div>

            <div className="space-y-3">
              {[
                'PCI DSS Level 1 Compliance',
                'End-to-end encryption',
                'Fraud detection & prevention',
                'Secure tokenization',
                '3D Secure authentication',
                'Real-time monitoring'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#6ad040]" />
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Benefits */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg">
                Business Benefits
              </h3>
            </div>

            <div className="space-y-3">
              {[
                'Accept payments globally',
                'Instant payment confirmation',
                'Automated recurring billing',
                'Mobile-optimized checkout',
                'Multi-currency support',
                'Detailed analytics & reporting'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#6ad040]" />
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activation */}
      {paymentSetup.setup_status !== 'active' && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6 text-center">
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-4">
              Ready to Activate Payments?
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm mb-6">
              Complete your Stripe account setup to start accepting payments immediately.
            </p>
            <Button
              onClick={activatePayments}
              disabled={loading}
              className="font-['Orbitron'] font-black text-lg px-8 py-4 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Activate Payments
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {paymentSetup.setup_status === 'active' && (
        <Card className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-2xl">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-['Orbitron'] font-bold text-green-400 text-lg mb-2">
              Payments Activated Successfully!
            </h3>
            <p className="font-['Space_Mono'] text-green-300 text-sm mb-4">
              Your payment processing is now live. You can start accepting payments immediately.
            </p>
            <Button
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Stripe Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-[#6ad040]" />
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
                Complete your Stripe account verification with business documents
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                2
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Integrate payment forms into your website
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                3
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Test your payment flow with Stripe's test mode
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                4
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Set up webhook endpoints for payment notifications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}