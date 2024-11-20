import { Badge } from '@/components/ui/badge'
import Marquee from '@/components/ui/marquee'
import { motion } from 'framer-motion'

export function PromptsMarquee({ prompts }) {
  return (
    <div className="py-4 bg-muted/30">
      <Marquee 
        className="py-2" 
        pauseOnHover={true}
      >
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {prompts.map((prompt, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className="flex items-center gap-2 py-2 px-4 whitespace-nowrap hover:bg-secondary/80 transition-colors cursor-default"
            >
              <span className="text-lg">{prompt.icon}</span>
              <span className="font-medium">{prompt.title}:</span>
              <span className="text-muted-foreground">{prompt.description}</span>
            </Badge>
          ))}
        </motion.div>
      </Marquee>
    </div>
  )
} 