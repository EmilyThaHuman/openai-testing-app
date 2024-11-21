import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function MetricCard({ title, value, change, icon: Icon, color, className }) {
  // Format value to handle NaN and undefined
  const formattedValue = () => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toLocaleString()
    }
    return '0' // Default value when NaN or undefined
  }

  // Format change percentage
  const formattedChange = () => {
    if (typeof change === 'number' && !isNaN(change)) {
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    }
    return '+0%' // Default value when NaN or undefined
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={cn("p-6 overflow-hidden", className)}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <pattern
            id={`pattern-${title}`}
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
            className="text-gray-900"
            fill="currentColor"
          >
            <rect width="4" height="4" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pattern-${title})`} />
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <Icon className={cn("h-5 w-5", color)} />
            <span className={cn(
              "text-sm font-medium",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formattedChange()}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
            <p className="text-2xl font-bold">
              {formattedValue()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 