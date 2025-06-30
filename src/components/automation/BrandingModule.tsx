import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { businessAutomation, type BusinessProfile, type BrandAsset } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  Palette, 
  Type, 
  Download, 
  CheckCircle, 
  Loader2,
  Eye,
  Copy,
  Sparkles
} from 'lucide-react'

interface BrandingModuleProps {
  businessProfile?: BusinessProfile
  onComplete?: (assets: BrandAsset[]) => void
}

export const BrandingModule: React.FC<BrandingModuleProps> = ({ businessProfile, onComplete }) => {
  const { user } = useApp()
  const [assets, setAssets] = useState<BrandAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generating' | 'review'>('generating')

  useEffect(() => {
    if (businessProfile) {
      generateBrandAssets()
    }
  }, [businessProfile])

  const generateBrandAssets = async () => {
    if (!businessProfile) return

    setLoading(true)
    try {
      const generatedAssets = await businessAutomation.generateBrandAssets(businessProfile)
      setAssets(generatedAssets)
      setStep('review')
      
      trackEvent('brand_assets_generated', {
        business_name: businessProfile.business_name,
        industry: businessProfile.industry,
        asset_count: generatedAssets.length
      })

      if (onComplete) {
        onComplete(generatedAssets)
      }
    } catch (error) {
      console.error('Error generating brand assets:', error)
      alert('Failed to generate brand assets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const downloadAsset = (asset: BrandAsset) => {
    const blob = new Blob([JSON.stringify(asset.asset_data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${asset.asset_type}-${businessProfile?.business_name?.replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent('brand_asset_downloaded', {
      asset_type: asset.asset_type,
      business_name: businessProfile?.business_name
    })
  }

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8">
            <Loader2 className="w-16 h-16 text-[#6ad040] animate-spin mx-auto mb-6" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              CREATING YOUR BRAND
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Sigma is designing a brand that doesn't look like Canva threw up...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const colorPalette = assets.find(asset => asset.asset_type === 'color_palette')?.asset_data
  const typography = assets.find(asset => asset.asset_type === 'typography')?.asset_data
  const brandGuidelines = assets.find(asset => asset.asset_type === 'brand_guidelines')?.asset_data

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            BRAND IDENTITY COMPLETE
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Your brand identity has been created with sigma energy. No Canva disasters here.
        </p>
      </div>

      {/* Color Palette */}
      {colorPalette && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Color Palette
                </h3>
              </div>
              <Button
                onClick={() => downloadAsset(assets.find(a => a.asset_type === 'color_palette')!)}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Primary</h4>
                <div 
                  className="w-full h-20 rounded-lg border border-[#6ad040]/30"
                  style={{ backgroundColor: colorPalette.primary }}
                />
                <div className="flex items-center gap-2">
                  <code className="font-['Space_Mono'] text-[#b7ffab] text-sm bg-black/40 px-2 py-1 rounded">
                    {colorPalette.primary}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(colorPalette.primary)}
                    className="p-1 h-auto bg-transparent hover:bg-[#6ad040]/20 text-[#6ad040]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  {colorPalette.usage.primary}
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Secondary</h4>
                <div 
                  className="w-full h-20 rounded-lg border border-[#6ad040]/30"
                  style={{ backgroundColor: colorPalette.secondary }}
                />
                <div className="flex items-center gap-2">
                  <code className="font-['Space_Mono'] text-[#b7ffab] text-sm bg-black/40 px-2 py-1 rounded">
                    {colorPalette.secondary}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(colorPalette.secondary)}
                    className="p-1 h-auto bg-transparent hover:bg-[#6ad040]/20 text-[#6ad040]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  {colorPalette.usage.secondary}
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Accent</h4>
                <div 
                  className="w-full h-20 rounded-lg border border-[#6ad040]/30"
                  style={{ backgroundColor: colorPalette.accent }}
                />
                <div className="flex items-center gap-2">
                  <code className="font-['Space_Mono'] text-[#b7ffab] text-sm bg-black/40 px-2 py-1 rounded">
                    {colorPalette.accent}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(colorPalette.accent)}
                    className="p-1 h-auto bg-transparent hover:bg-[#6ad040]/20 text-[#6ad040]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                  {colorPalette.usage.accent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typography */}
      {typography && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Type className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Typography
                </h3>
              </div>
              <Button
                onClick={() => downloadAsset(assets.find(a => a.asset_type === 'typography')!)}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Heading Font */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Heading Font</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <p className="text-2xl font-bold text-[#b7ffab] mb-2" style={{ fontFamily: typography.heading.family }}>
                    {typography.heading.family}
                  </p>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                    {typography.heading.usage}
                  </p>
                </div>
              </div>

              {/* Body Font */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Body Font</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <p className="text-lg text-[#b7ffab] mb-2" style={{ fontFamily: typography.body.family }}>
                    {typography.body.family}
                  </p>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                    {typography.body.usage}
                  </p>
                </div>
              </div>

              {/* Accent Font */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Accent Font</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <p className="text-lg text-[#b7ffab] mb-2" style={{ fontFamily: typography.accent.family }}>
                    {typography.accent.family}
                  </p>
                  <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                    {typography.accent.usage}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Guidelines */}
      {brandGuidelines && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Brand Guidelines
                </h3>
              </div>
              <Button
                onClick={() => downloadAsset(assets.find(a => a.asset_type === 'brand_guidelines')!)}
                className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Personality */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Brand Personality</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <div className="flex flex-wrap gap-2">
                    {brandGuidelines.brandPersonality.map((trait: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded-full text-xs font-['Space_Mono'] font-bold"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voice & Tone */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Voice & Tone</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                    {brandGuidelines.voiceAndTone.voice}
                  </p>
                </div>
              </div>

              {/* Key Messages */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Key Messages</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <ul className="space-y-2">
                    {brandGuidelines.voiceAndTone.messaging.keyMessages.map((message: string, index: number) => (
                      <li key={index} className="font-['Space_Mono'] text-[#b7ffab] text-sm flex items-start gap-2">
                        <span className="text-[#6ad040] mt-1">•</span>
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="space-y-3">
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm">Call to Actions</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                  <div className="flex flex-wrap gap-2">
                    {brandGuidelines.voiceAndTone.messaging.callToAction.map((cta: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#6ad040] text-[#161616] rounded-lg text-xs font-['Space_Mono'] font-bold"
                      >
                        {cta}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-[#6ad040]" />
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
                Download your brand assets and save them to your design tools
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                2
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Use these colors and fonts consistently across all your marketing materials
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                3
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Apply your brand guidelines to your website, business cards, and social media
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}