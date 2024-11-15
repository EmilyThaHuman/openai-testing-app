import { motion } from 'framer-motion'
import { floatAnimation } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function Logo({ size = "default" }) {
  const sizes = {
    default: "w-8 h-8",
    sm: "w-6 h-6",
    lg: "w-10 h-10"
  }

  return (
    <Link 
      to="/"
      className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
    >
      <motion.img
        alt="ReedAI API Playground"
        className={sizes[size]}
        src="/reedai-api-playground.svg"
        {...floatAnimation}
      />
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