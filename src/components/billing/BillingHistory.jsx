import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow, format } from 'date-fns'

export function BillingHistory({ history = [] }) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.date), 'PPP')} • 
                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${item.amount}</p>
              <p className="text-sm text-muted-foreground">{item.status}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )
} 