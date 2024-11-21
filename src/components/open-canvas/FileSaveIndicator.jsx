import { motion, AnimatePresence } from 'framer-motion'
import { Save, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FileSaveIndicator({ status, className }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "flex items-center gap-2 text-sm",
          status === 'saved' && "text-green-500",
          status === 'saving' && "text-yellow-500",
          status === 'error' && "text-red-500",
          className
        )}
      >
        {status === 'saved' && (
          <>
            <Check className="h-4 w-4" />
            <span>All changes saved</span>
          </>
        )}
        {status === 'saving' && (
          <>
            <Save className="h-4 w-4 animate-pulse" />
            <span>Saving...</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>Failed to save</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 