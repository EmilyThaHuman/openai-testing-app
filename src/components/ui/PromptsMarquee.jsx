import Marquee from 'react-fast-marquee'
import { Badge } from '@/components/ui/badge'

const CODING_PROMPTS = [
  "Test OpenAI Chat Completions API",
  "Visualize API response data",
  "Configure Assistant API endpoints",
  "Test image generation models",
  "Integrate speech-to-text API",
  "Monitor API usage metrics",
  "Debug API response errors",
  "Test streaming responses",
  "Configure model parameters",
  "Validate API authentication",
  "Test function calling",
  "Analyze token usage",
  "Test moderation endpoints",
  "Configure API rate limits",
  "Test embeddings generation"
]

export function PromptsMarquee() {
  return (
    <div className="py-4 bg-muted/30">
      <Marquee
        gradient={true}
        gradientColor={[255, 255, 255]}
        speed={40}
        pauseOnHover={true}
      >
        <div className="flex gap-4 px-4">
          {CODING_PROMPTS.map((prompt, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className="text-sm py-2 px-4 whitespace-nowrap"
            >
              {prompt}
            </Badge>
          ))}
        </div>
      </Marquee>
    </div>
  )
} 