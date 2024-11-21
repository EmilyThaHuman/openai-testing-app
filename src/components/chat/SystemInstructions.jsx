import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Wand2, Loader2, Save, X, Edit, AlertCircle } from 'lucide-react'
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  }
}

const PROMPT_TEMPLATES = {
  'gpt-4-turbo-preview': `You are an AI assistant. Your role is to help users with their tasks in a clear, concise, and helpful manner. Please:
- Provide accurate and relevant information
- Break down complex problems into manageable steps
- Use examples when helpful
- Maintain a professional and friendly tone
- Ask for clarification when needed`,
  'gpt-4': `You are a highly capable AI assistant powered by GPT-4. Your purpose is to:
- Provide in-depth analysis and explanations
- Help with complex problem-solving
- Offer creative solutions and perspectives
- Maintain accuracy and clarity in communication
- Engage in detailed technical discussions when appropriate`,
  'gpt-3.5-turbo': `You are a helpful AI assistant. Your goals are to:
- Provide quick and accurate responses
- Help users with their questions and tasks
- Maintain a conversational and friendly tone
- Be clear and concise in your explanations
- Ask for clarification when needed`
};

export function SystemInstructions() {
  // State selectors
  const systemPrompt = useStore(state => state.aiSettings.systemPrompt)
  const setSystemPrompt = useStore(state => state.setSystemPrompt)
  const model = useStore(state => state.aiSettings.model)
  const isLoading = useStore(state => state.isLoading)
  const apiKey = useStore(state => state.apiKey)

  // Local state
  const [isEditing, setIsEditing] = useState(false)
  const [tempPrompt, setTempPrompt] = useState(systemPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Sync with store changes
  useEffect(() => {
    setTempPrompt(systemPrompt)
  }, [systemPrompt])

  // Clear error on mode change
  useEffect(() => {
    setError(null)
  }, [isEditing])

  const handleSave = useCallback(() => {
    try {
      setSystemPrompt(tempPrompt)
      setIsEditing(false)
      toast({
        title: 'Instructions saved',
        description: 'System instructions have been updated successfully',
      })
    } catch (err) {
      setError(err.message)
    }
  }, [tempPrompt, setSystemPrompt, toast])

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('API Key Required. Please set your OpenAI API key in settings')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      const openai = new UnifiedOpenAIService(apiKey)
      const basePrompt = PROMPT_TEMPLATES[model] || PROMPT_TEMPLATES['gpt-4-turbo-preview']
      
      const response = await openai.createChatCompletion({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that specializes in creating system prompts for other AI models.'
          },
          {
            role: 'user',
            content: `Generate a detailed system prompt for the ${model} model. Use this as a base: ${basePrompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      if (response?.choices?.[0]?.message?.content) {
        const generatedPrompt = response.choices[0].message.content
        setTempPrompt(generatedPrompt)
        toast({
          title: 'Instructions generated',
          description: 'New system instructions have been generated. Review and save to apply.',
        })
      } else {
        throw new Error('Invalid response format from OpenAI')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      toast({
        title: 'Error generating instructions',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [model, toast, apiKey])

  const handleCancel = useCallback(() => {
    setTempPrompt(systemPrompt)
    setIsEditing(false)
    setError(null)
  }, [systemPrompt])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 p-4 bg-background/95 backdrop-blur border-b"
    >
      {error && (
        <motion.div
          variants={itemVariants}
          className="mb-4"
        >
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {isEditing ? (
        <>
          <Textarea
            value={tempPrompt}
            onChange={(e) => setTempPrompt(e.target.value)}
            placeholder="Enter system instructions..."
            className={cn(
              "min-h-[100px] w-full p-3",
              "bg-background/50 backdrop-blur",
              "border border-border/50 rounded-md",
              "text-sm font-mono leading-relaxed",
              "resize-none focus:ring-1 focus:ring-primary",
              "placeholder:text-muted-foreground",
              (isLoading || isGenerating) && "opacity-50 cursor-not-allowed"
            )}
            disabled={isLoading || isGenerating}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading || isGenerating}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isLoading || isGenerating || !apiKey}
              className={cn(
                "h-8",
                "bg-primary/90 hover:bg-primary",
                "text-primary-foreground"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-1" />
              )}
              Generate
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading || isGenerating}
              className="h-8"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <pre className={cn(
              "p-4 rounded-md",
              "bg-muted/50 backdrop-blur",
              "border border-border/50",
              "text-sm font-mono leading-relaxed",
              "whitespace-pre-wrap",
              "max-h-[200px] overflow-y-auto",
              "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            )}>
              {systemPrompt || PROMPT_TEMPLATES[model]}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className={cn(
                "absolute top-2 right-2",
                "h-7 px-2",
                "bg-background/95 backdrop-blur",
                "hover:bg-accent"
              )}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default React.memo(SystemInstructions)
