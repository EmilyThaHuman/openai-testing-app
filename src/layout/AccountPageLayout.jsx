import React from 'react'
import { motion } from 'framer-motion'
import { pageVariants } from '@/config/animations'

export function AccountPageLayout({ children, title }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-1 flex flex-col w-full min-h-0 overflow-auto"
    >
      <div className="flex-1 flex flex-col w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="container max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
        </div>
        
        <div className="flex-1 container max-w-7xl mx-auto p-6">
          <div className="flex-1 flex flex-col w-full min-h-0">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 