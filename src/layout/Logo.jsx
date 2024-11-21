import { motion } from 'framer-motion'
import { floatAnimation } from '@/lib/utils'

export function Logo() {
  return (
    <motion.a 
      href="/"
      className="flex items-center space-x-2 hover:scale-105 transition-transform"
      whileHover={{ scale: 1.05 }}
    >
      <motion.img
        alt="Magic UI logo"
        className="w-8 h-8"
        src="https://storage.googleapis.com/a1aa/image/epQSGC3ZTRTiLCP3Ln8aq7rL2MWgKJPWXOmiB3GueyzBWQxTA.jpg"
        {...floatAnimation}
      />
      <span className="font-semibold text-xl">Magic UI</span>
      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
        Beta
      </span>
    </motion.a>
  )
} 