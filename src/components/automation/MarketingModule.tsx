import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { businessAutomation, type BusinessProfile, type MarketingCampaign, type BrandAsset } from '../../lib/businessAutomation'
import { useApp } from '../../contexts/AppContext'
import { trackEvent } from '../../lib/analytics'
import { 
  TrendingUp, 
  CheckCircle, 
  Loader2,
  Mail,
  Share2,
  FileText,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react'

interface MarketingModuleProps {
  businessProfile?: BusinessProfile
  brandAssets?: BrandAsset[]
  onComplete?: (campaigns: MarketingCampaign[]) => void
}

export const MarketingModule: React.FC<MarketingModuleProps> = ({ businessProfile, brandAssets, onComplete }) => {
  const { user } = useApp()
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generating' | 'review'>('generating')

  useEffect(() => {
    if (businessProfile && brandAssets) {
      generateMarketingCampaigns()
    }
  }, [businessProfile, brandAssets])

  const generateMarketingCampaigns = async () => {
    if (!businessProfile || !brandAssets) return

    setLoading(true)
    try {
      const generatedCampaigns = await businessAutomation.generateMarketingCampaigns(businessProfile, brandAssets)
      setCampaigns(generatedCampaigns)
      setStep('review')
      
      trackEvent('marketing_campaigns_generated', {
        business_name: businessProfile.business_name,
        campaign_count: generatedCampaigns.length
      })

      if (onComplete) {
        onComplete(generatedCampaigns)
      }
    } catch (error) {
      console.error('Error generating marketing campaigns:', error)
      alert('Failed to generate marketing campaigns. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activateCampaign = async (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: 'active' }
        : campaign
    ))

    trackEvent('marketing_campaign_activated', {
      business_name: businessProfile?.business_name,
      campaign_id: campaignId
    })
  }

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-8">
            <Loader2 className="w-16 h-16 text-[#6ad040] animate-spin mx-auto mb-6" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl mb-4">
              CREATING MARKETING CAMPAIGNS
            </h3>
            <p className="font-['Space_Mono'] text-[#b7ffab]/80 text-sm">
              Building marketing that runs itself. Promoting your business is now a piece of cake...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const socialMediaCampaign = campaigns.find(c => c.campaign_type === 'social_media')
  const emailCampaign = campaigns.find(c => c.campaign_type === 'email')
  const contentCampaign = campaigns.find(c => c.campaign_type === 'content')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-[#6ad040]" />
          <h2 className="font-['Orbitron'] font-black text-[#ffff] text-2xl lg:text-3xl">
            MARKETING AUTOMATION READY
          </h2>
        </div>
        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base opacity-90">
          Marketing that runs itself. Promoting your business is now a piece of cake.
        </p>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {campaigns.map((campaign, index) => (
          <Card key={index} className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                {campaign.campaign_type === 'social_media' && <Share2 className="w-8 h-8 text-[#6ad040]" />}
                {campaign.campaign_type === 'email' && <Mail className="w-8 h-8 text-[#6ad040]" />}
                {campaign.campaign_type === 'content' && <FileText className="w-8 h-8 text-[#6ad040]" />}
              </div>
              <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                {campaign.campaign_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-['Space_Mono'] font-bold ${
                campaign.status === 'active' 
                  ? 'bg-[#6ad040]/20 text-[#6ad040]' 
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {campaign.status.toUpperCase()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Media Campaign */}
      {socialMediaCampaign && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Social Media Campaign
                </h3>
              </div>
              {socialMediaCampaign.status !== 'active' && (
                <Button
                  onClick={() => activateCampaign(socialMediaCampaign.id!)}
                  className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
                >
                  Activate Campaign
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Post Templates */}
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">Post Templates</h4>
                <div className="space-y-3">
                  {socialMediaCampaign.content.posts.map((post: any, index: number) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs font-bold">
                          {post.platform.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {post.schedule}
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags & Schedule */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">Hashtag Strategy</h4>
                  <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                    <div className="flex flex-wrap gap-2">
                      {socialMediaCampaign.content.hashtags.map((hashtag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">Posting Schedule</h4>
                  <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6ad040]" />
                        <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                          Frequency: {socialMediaCampaign.schedule.frequency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {socialMediaCampaign.schedule.times.map((time: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {time}
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
      )}

      {/* Email Campaign */}
      {emailCampaign && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Email Marketing Campaign
                </h3>
              </div>
              {emailCampaign.status !== 'active' && (
                <Button
                  onClick={() => activateCampaign(emailCampaign.id!)}
                  className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
                >
                  Activate Campaign
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {emailCampaign.content.sequences.map((sequence: any, seqIndex: number) => (
                <div key={seqIndex}>
                  <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">
                    {sequence.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sequence.emails.map((email: any, emailIndex: number) => (
                      <div key={emailIndex} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs font-bold">
                            Day {email.delay}
                          </span>
                          {email.recurring && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                              {email.recurring}
                            </span>
                          )}
                        </div>
                        <h5 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">
                          {email.subject}
                        </h5>
                        <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                          {email.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Campaign */}
      {contentCampaign && (
        <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#6ad040]" />
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
                  Content Marketing Campaign
                </h3>
              </div>
              {contentCampaign.status !== 'active' && (
                <Button
                  onClick={() => activateCampaign(contentCampaign.id!)}
                  className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-4 py-2 rounded-lg"
                >
                  Activate Campaign
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blog Posts */}
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">Blog Post Ideas</h4>
                <div className="space-y-3">
                  {contentCampaign.content.blogPosts.map((post: any, index: number) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs font-bold">
                          {post.publishDate}
                        </span>
                      </div>
                      <h5 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">
                        {post.title}
                      </h5>
                      <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs mb-2">
                        {post.outline}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {post.keywords.map((keyword: string, kIndex: number) => (
                          <span key={kIndex} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Strategy */}
              <div>
                <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-3">SEO Strategy</h4>
                <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30 mb-4">
                  <h5 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Target Keywords</h5>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {contentCampaign.content.seoStrategy.targetKeywords.map((keyword: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-[#6ad040]/20 text-[#6ad040] rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <h5 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Content Pillars</h5>
                  <div className="space-y-2">
                    {contentCampaign.content.seoStrategy.contentPillars.map((pillar: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-[#6ad040]" />
                        <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">{pillar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tracking */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-[#6ad040]" />
            <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl">
              Performance Tracking
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30 text-center">
              <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Social Media</h4>
              <div className="text-2xl font-['Orbitron'] font-bold text-[#6ad040] mb-1">0</div>
              <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">Posts Published</div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30 text-center">
              <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Email Marketing</h4>
              <div className="text-2xl font-['Orbitron'] font-bold text-[#6ad040] mb-1">0</div>
              <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">Emails Sent</div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-4 border border-[#6ad040]/30 text-center">
              <h4 className="font-['Space_Grotesk'] font-bold text-[#b7ffab] text-sm mb-2">Content Marketing</h4>
              <div className="text-2xl font-['Orbitron'] font-bold text-[#6ad040] mb-1">0</div>
              <div className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">Blog Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-black/30 backdrop-blur-md border border-[#6ad040]/40 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#6ad040]" />
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
                Set up social media accounts on recommended platforms
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                2
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Configure email marketing platform (Mailchimp, ConvertKit, etc.)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                3
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Start publishing content according to the generated schedule
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6ad040] rounded-full flex items-center justify-center text-[#161616] text-xs font-bold mt-0.5">
                4
              </div>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                Monitor performance and adjust campaigns based on analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}