// OpenRouter API Integration for Multi-Model Routing
import { AIRequest, AIResponse } from '../../types/app'
import { AI_CONFIG, getAPIKeys, AI_MODELS } from './config'

export class OpenRouterService {
  private static apiKey: string | null = null
  private static baseURL = AI_CONFIG.OPENROUTER_API_URL

  private static getAPIKey(): string {
    if (!this.apiKey) {
      const keys = getAPIKeys()
      this.apiKey = keys.OPENROUTER_API_KEY || null
      
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY environment variable.')
      }
    }
    return this.apiKey
  }

  /**
   * Make a completion request to OpenRouter
   */
  static async completion(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      const apiKey = this.getAPIKey()
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BasedSigma AI Business Automation'
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.context?.task_type)
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.max_tokens || 4000,
          temperature: request.temperature || 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const processingTime = Date.now() - startTime
      
      // Calculate cost estimate
      const model = AI_MODELS.find(m => m.id === request.model)
      const tokensUsed = data.usage?.total_tokens || 0
      const estimatedCost = model ? tokensUsed * model.cost_per_token : 0

      return {
        content: data.choices[0]?.message?.content || '',
        model_used: data.model || request.model,
        tokens_used: tokensUsed,
        cost: estimatedCost,
        processing_time: processingTime,
        session_id: request.session_id,
        confidence: this.calculateConfidence(data),
        reasoning: data.choices[0]?.finish_reason || 'completed'
      }

    } catch (error: any) {
      console.error('OpenRouter completion error:', error)
      
      return {
        content: '',
        model_used: request.model,
        tokens_used: 0,
        cost: 0,
        processing_time: Date.now() - startTime,
        session_id: request.session_id,
        confidence: 0,
        reasoning: `Error: ${error.message}`
      }
    }
  }

  /**
   * Stream completion for real-time responses
   */
  static async streamCompletion(
    request: AIRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: AIResponse) => void
  ): Promise<void> {
    const startTime = Date.now()
    let fullContent = ''
    
    try {
      const apiKey = this.getAPIKey()
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BasedSigma AI Business Automation'
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.context?.task_type)
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.max_tokens || 4000,
          temperature: request.temperature || 0.7,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              const finalResponse: AIResponse = {
                content: fullContent,
                model_used: request.model,
                tokens_used: fullContent.length / 4, // Rough estimate
                cost: 0,
                processing_time: Date.now() - startTime,
                session_id: request.session_id,
                confidence: 0.8,
                reasoning: 'stream_completed'
              }
              onComplete(finalResponse)
              return
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              
              if (content) {
                fullContent += content
                onChunk(content)
              }
            } catch (e) {
              // Skip malformed JSON chunks
            }
          }
        }
      }

    } catch (error: any) {
      console.error('OpenRouter stream error:', error)
      
      const errorResponse: AIResponse = {
        content: fullContent,
        model_used: request.model,
        tokens_used: 0,
        cost: 0,
        processing_time: Date.now() - startTime,
        session_id: request.session_id,
        confidence: 0,
        reasoning: `Error: ${error.message}`
      }
      
      onComplete(errorResponse)
    }
  }

  /**
   * Get available models from OpenRouter
   */
  static async getAvailableModels(): Promise<any[]> {
    try {
      const apiKey = this.getAPIKey()
      
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []

    } catch (error) {
      console.error('Error fetching OpenRouter models:', error)
      return []
    }
  }

  /**
   * Get system prompt based on task type
   */
  private static getSystemPrompt(taskType?: string): string {
    const basePrompt = `You are SIGMA, an advanced AI business automation assistant for the BasedSigma platform. You embody a "sigma" mindset - independent, results-driven, and focused on maximizing efficiency and success.

Your core principles:
- Provide actionable, practical solutions
- Focus on measurable business outcomes
- Maintain a professional yet confident tone
- Prioritize speed and efficiency
- Be direct and avoid unnecessary fluff
- Always consider cost-effectiveness and ROI`

    const taskPrompts = {
      'business-planning': `${basePrompt}

You specialize in creating comprehensive business plans that are:
- Market-validated and data-driven
- Financially realistic and detailed
- Implementation-focused with clear milestones
- Optimized for rapid execution and scaling`,

      'legal-drafting': `${basePrompt}

You specialize in legal document creation with:
- Precise legal language and terminology
- State-specific compliance requirements
- Risk mitigation strategies
- Clear, actionable clauses and provisions`,

      'branding': `${basePrompt}

You specialize in brand development with:
- Market positioning and differentiation
- Visual identity recommendations
- Brand voice and messaging strategies
- Competitive analysis and positioning`,

      'marketing': `${basePrompt}

You specialize in marketing automation with:
- Data-driven campaign strategies
- Multi-channel optimization
- Performance tracking and analytics
- ROI-focused budget allocation`
    }

    return taskPrompts[taskType as keyof typeof taskPrompts] || basePrompt
  }

  /**
   * Calculate confidence score based on response data
   */
  private static calculateConfidence(data: any): number {
    // Basic confidence calculation based on response completeness
    const hasContent = data.choices?.[0]?.message?.content?.length > 0
    const finishReason = data.choices?.[0]?.finish_reason
    
    if (!hasContent) return 0
    if (finishReason === 'length') return 0.6 // Truncated response
    if (finishReason === 'stop') return 0.9   // Natural completion
    
    return 0.7 // Default confidence
  }

  /**
   * Check service health
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const models = await this.getAvailableModels()
      return models.length > 0
    } catch (error) {
      console.error('OpenRouter health check failed:', error)
      return false
    }
  }
}