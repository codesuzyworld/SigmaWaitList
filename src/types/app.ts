// App-wide type definitions for BasedSigma
export interface User {
  id: string
  email: string
  name?: string
  language?: string
  region?: string
  stealth_mode?: boolean
  sdg_goals?: string[]
  low_tech_access?: boolean
  business_type?: string
  time_commitment?: string
  capital_level?: string
  completion_percentage?: number
  created_at?: string
  updated_at?: string
}

export interface AppMode {
  isAppMode: boolean
  hasAccess: boolean
}

export interface BusinessData {
  id?: string
  user_id: string
  business_name?: string
  tagline?: string
  domain_ideas?: string[]
  logo_url?: string
  color_palette?: Record<string, any>
  font_selections?: Record<string, any>
  brand_kit_url?: string
  created_at?: string
}

export interface AIResponse {
  content: string
  confidence?: number
  model_used?: string
  prompt_used?: string
  reasoning?: string
}

export type ModuleType = 
  | 'dashboard' 
  | 'onboarding' 
  | 'branding' 
  | 'legal' 
  | 'marketing' 
  | 'revenue' 
  | 'impact' 
  | 'grants' 
  | 'strategy' 
  | 'community'

export interface ModuleProgress {
  [key: string]: {
    completed: boolean
    progress: number
    last_updated?: string
  }
}

// AI Service Types
export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'openrouter'
  cost_per_token: number
  max_tokens: number
  capabilities: AICapability[]
}

export type AICapability = 
  | 'text-generation' 
  | 'code-generation' 
  | 'image-generation' 
  | 'document-analysis' 
  | 'legal-drafting' 
  | 'business-planning'

export interface AIRequest {
  model: string
  prompt: string
  max_tokens?: number
  temperature?: number
  context?: Record<string, any>
  user_id: string
  session_id?: string
}

export interface AIResponse {
  content: string
  confidence?: number
  model_used?: string
  prompt_used?: string
  reasoning?: string
  tokens_used?: number
  cost?: number
  processing_time?: number
  session_id?: string
}

// Business Plan Generation Types
export interface BusinessPlanRequest {
  business_type: string
  industry: string
  target_market: string
  business_model: string
  capital_requirements: string
  timeline: string
  location: string
  additional_context?: string
}

export interface BusinessPlan {
  id: string
  user_id: string
  executive_summary: string
  business_description: string
  market_analysis: string
  organization_management: string
  service_product_line: string
  marketing_sales: string
  funding_request: string
  financial_projections: string
  appendix?: string
  created_at: string
  updated_at: string
}

// Legal Document Types
export interface LegalDocumentRequest {
  document_type: 'llc_articles' | 'operating_agreement' | 'terms_of_service' | 'privacy_policy' | 'employment_contract'
  business_name: string
  state: string
  business_type: string
  owners: LegalEntity[]
  specific_requirements?: Record<string, any>
}

export interface LegalEntity {
  name: string
  role: string
  ownership_percentage?: number
  address?: string
}

export interface LegalDocument {
  id: string
  user_id: string
  document_type: string
  title: string
  content: string
  status: 'draft' | 'reviewed' | 'final'
  created_at: string
  updated_at: string
}

// Brand Identity Types
export interface BrandIdentityRequest {
  business_name: string
  industry: string
  target_audience: string
  brand_personality: string[]
  color_preferences?: string[]
  style_preferences?: string[]
  competitors?: string[]
}

export interface BrandIdentity {
  id: string
  user_id: string
  business_name: string
  logo_concepts: BrandAsset[]
  color_palette: ColorPalette
  typography: Typography
  brand_guidelines: string
  created_at: string
  updated_at: string
}

export interface BrandAsset {
  type: 'logo' | 'icon' | 'wordmark'
  url: string
  description: string
  variations?: string[]
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  neutral: string[]
  gradients?: string[]
}

export interface Typography {
  primary_font: string
  secondary_font: string
  heading_styles: Record<string, any>
  body_styles: Record<string, any>
}

// Marketing Automation Types
export interface MarketingCampaign {
  id: string
  user_id: string
  name: string
  type: 'email' | 'social' | 'content' | 'ads'
  target_audience: string
  content: MarketingContent[]
  schedule: CampaignSchedule
  metrics: CampaignMetrics
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

export interface MarketingContent {
  type: 'text' | 'image' | 'video' | 'carousel'
  content: string
  media_url?: string
  cta?: string
  platform_specific?: Record<string, any>
}

export interface CampaignSchedule {
  start_date: string
  end_date?: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  times: string[]
  timezone: string
}

export interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  cost: number
  roi?: number
}

// Workflow Types
export interface AutomationWorkflow {
  id: string
  user_id: string
  name: string
  module_type: ModuleType
  steps: WorkflowStep[]
  status: 'inactive' | 'active' | 'paused' | 'completed' | 'error'
  progress: number
  created_at: string
  updated_at: string
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'ai_generation' | 'user_input' | 'api_call' | 'document_creation' | 'notification'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  config: Record<string, any>
  output?: any
  error_message?: string
  completed_at?: string
}