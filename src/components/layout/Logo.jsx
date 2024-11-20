import { motion } from 'framer-motion'
import { AppIcon } from '@/components/ui/AppIcon'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link 
      to="/"
      className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
    >
      <AppIcon size="md" />
      <div className="flex items-center">
        <span className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
          ReedAI
        </span>
        <span className="text-foreground/80 font-medium ml-1">
          API Playground
        </span>
        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">
          Beta
        </span>
      </div>
    </Link>
  )
} 