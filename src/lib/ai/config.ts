// AI Service Configuration
import { AIModel } from '../../types/app'

export const AI_CONFIG = {
  OPENROUTER_API_URL: 'https://openrouter.ai/api/v1',
  OPENAI_API_URL: 'https://api.openai.com/v1',
  ANTHROPIC_API_URL: 'https://api.anthropic.com/v1',
  
  // Default model preferences for different tasks
  DEFAULT_MODELS: {
    BUSINESS_PLANNING: 'openai/gpt-4o',
    LEGAL_DRAFTING: 'anthropic/claude-3.5-sonnet',
    CREATIVE_WRITING: 'openai/gpt-4o',
    CODE_GENERATION: 'openai/gpt-4o',
    IMAGE_GENERATION: 'openai/dall-e-3',
    ANALYSIS: 'anthropic/claude-3.5-sonnet',
    GENERAL: 'openrouter/auto'
  },
  
  // Cost optimization thresholds
  COST_THRESHOLDS: {
    LOW: 0.001,    // $0.001 per token
    MEDIUM: 0.01,  // $0.01 per token
    HIGH: 0.1      // $0.1 per token
  },
  
  // Rate limiting
  RATE_LIMITS: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
    REQUESTS_PER_DAY: 10000
  }
}

// Supported AI Models
export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    cost_per_token: 0.00005,
    max_tokens: 128000,
    capabilities: ['text-generation', 'code-generation', 'business-planning']
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    cost_per_token: 0.00015,
    max_tokens: 128000,
    capabilities: ['text-generation', 'code-generation']
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    cost_per_token: 0.003,
    max_tokens: 200000,
    capabilities: ['text-generation', 'document-analysis', 'legal-drafting']
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    cost_per_token: 0.00025,
    max_tokens: 200000,
    capabilities: ['text-generation', 'document-analysis']
  },
  {
    id: 'openai/dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    cost_per_token: 0.04, // Per image
    max_tokens: 1024,
    capabilities: ['image-generation']
  }
]

// Get environment variables
export const getAPIKeys = () => ({
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY
})

// Validate API keys
export const validateAPIKeys = () => {
  const keys = getAPIKeys()
  const missing = []
  
  if (!keys.OPENROUTER_API_KEY) missing.push('VITE_OPENROUTER_API_KEY')
  if (!keys.OPENAI_API_KEY) missing.push('VITE_OPENAI_API_KEY')
  if (!keys.ANTHROPIC_API_KEY) missing.push('VITE_ANTHROPIC_API_KEY')
  
  if (missing.length > 0) {
    console.warn('Missing AI API keys:', missing)
    return false
  }
  
  return true
}

// Get optimal model for task
export const getOptimalModel = (capability: string, priority: 'cost' | 'quality' | 'speed' = 'quality'): string => {
  const capableModels = AI_MODELS.filter(model => 
    model.capabilities.includes(capability as any)
  )
  
  if (capableModels.length === 0) {
    return AI_CONFIG.DEFAULT_MODELS.GENERAL
  }
  
  switch (priority) {
    case 'cost':
      return capableModels.sort((a, b) => a.cost_per_token - b.cost_per_token)[0].id
    case 'speed':
      // Prefer smaller, faster models
      return capableModels.sort((a, b) => a.max_tokens - b.max_tokens)[0].id
    case 'quality':
    default:
      // Prefer larger, more capable models
      return capableModels.sort((a, b) => b.max_tokens - a.max_tokens)[0].id
  }
}