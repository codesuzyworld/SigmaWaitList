import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { businessAutomation, type BusinessProfile, type WebsiteConfig, type BrandAsset } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  Globe, 
  Layout, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  Search,
  Smartphone,
  Zap
} from 'lucide-react'

interface WebsiteModuleProps {
  businessProfile?: BusinessProfile
  brandAssets?: BrandAsset[]
  onComplete?: (config: WebsiteConfig) => void
}

export const WebsiteModule: React.FC<WebsiteModuleProps> = ({ businessProfile, brandAssets, onComplete }) => {
  const { user } = useApp()
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generating' | 'review'>('generating')

  useEffect(() => {
    if (businessProfile && brandAssets) {
      generateWebsiteConfig()
    }
  }, [businessProfile, brandAssets])

  const generateWebsiteConfig = async () => {
    if (!businessProfile || !brandAssets) return

    setLoading(true)
    try {
      const config = await businessAutomation.generateWebsiteConfig(businessProfile, brandAssets)
      setWebsiteConfig(config)
      setStep('review')
      
      trackEvent('website_config_generated', {
        business_name: businessProfile.business_name,
        template_type: config.template_type,
        page_count: config.pages.length
      })

      if (onComplete) {
        onComplete(config)
      }
    } catch (error) {
      console.error('Error generating website config:', error)
      alert('Failed to generate website configuration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deployWebsite = async () => {
    if (!websiteConfig) return

    setLoading(true)
    try {
      // Simulate website deployment
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const deploymentUrl = `https://${businessProfile?.business_name?.toLowerCase().replace(/\s+/g, '-')}-demo.sigma.com`
      
      setWebsiteConfig(prev => prev ? {
        ...prev,
        deployment_url: deploymentUrl,
        status: 'deployed'
      } : null)

      trackEvent('website_deployed', {
        business_name: businessProfile?.business_name,
        deployment_url: deploymentUrl
      })
    } catch (error) {
      console.error('Error deploying website:', error)
      alert('Failed to deploy website. Please try again.')
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
              BUILDING YOUR WEBSITE
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Creating a website that converts, not just exists. Bringing all the sigma to your backyard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!websiteConfig) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            WEBSITE BLUEPRINT READY
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Your website configuration is complete. Ready to bring all the sigma to your backyard.
        </p>
      </div>

      {/* Website Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template & Structure */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Layout className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Website Structure
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Template Type</h4>
                <span className="px-3 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded-full text-sm font-['Space_Mono'] font-bold">
                  {websiteConfig.template_type.toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Pages ({websiteConfig.pages.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {websiteConfig.pages.map((page, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-2 border border-[#6ad040]/30">
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">{page}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Features</h4>
                <div className="space-y-2">
                  {websiteConfig.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#6ad040]" />
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain & SEO */}
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Domain & SEO
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Domain Suggestions</h4>
                <div className="space-y-2">
                  {websiteConfig.domain_suggestions.slice(0, 4).map((domain, index) => (
                    <div key={index} className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-[#6ad040]/30">
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{domain}</span>
                      <Button className="text-xs px-2 py-1 h-auto bg-[#6ad040] hover:bg-[#79e74c] text-[#161616]">
                        Check
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">SEO Configuration</h4>
                <div className="bg-black/40 rounded-lg p-3 border border-[#6ad040]/30">
                  <div className="space-y-2">
                    <div>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">Title:</span>
                      <p className="font-['Space_Mono'] text-[#b7ffab] text-xs">{websiteConfig.seo_config.title}</p>
                    </div>
                    <div>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">Description:</span>
                      <p className="font-['Space_Mono'] text-[#b7ffab] text-xs">{websiteConfig.seo_config.description}</p>
                    </div>
                    <div>
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {websiteConfig.seo_config.keywords.map((keyword: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Website Preview */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-[#6ad040]" />
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                Website Preview
              </h3>
            </div>
            {websiteConfig.status === 'deployed' ? (
              <Button
                onClick={() => window.open(websiteConfig.deployment_url, '_blank')}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live Site
              </Button>
            ) : (
              <Button
                onClick={deployWebsite}
                disabled={loading}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy Website
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Mock Website Preview */}
          <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
              {/* Mock Browser Bar */}
              <div className="bg-[#2a2a2a] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-[#1a1a1a] rounded px-3 py-1 ml-4">
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">
                    {websiteConfig.deployment_url || websiteConfig.domain_suggestions[0]}
                  </span>
                </div>
              </div>

              {/* Mock Website Content */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <h1 className="font-['Orbitron'] font-bold text-[#6ad040] text-2xl mb-2">
                    {businessProfile?.business_name}
                  </h1>
                  <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                    {businessProfile?.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {websiteConfig.pages.slice(0, 3).map((page, index) => (
                    <div key={index} className="bg-[#6ad040]/10 rounded p-3 text-center">
                      <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                        {page}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="inline-block bg-[#6ad040] text-[#161616] px-4 py-2 rounded font-['Space_Mono'] text-xs font-bold">
                    Get Started Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {websiteConfig.deployment_url && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-['Space_Mono'] text-green-400 text-sm font-bold">
                  Website deployed successfully!
                </span>
              </div>
              <p className="font-['Space_Mono'] text-green-300 text-xs mt-1">
                Your website is now live at: {websiteConfig.deployment_url}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-[#6ad040]" />
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
                Purchase your preferred domain name from a domain registrar
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                2
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Connect your domain to the deployed website
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                3
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Customize content and add your specific business information
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                4
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Set up analytics and tracking to monitor your website performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}