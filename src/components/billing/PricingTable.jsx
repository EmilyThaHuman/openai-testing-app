import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PricingTable({ 
  plans, 
  currentPlan, 
  onSelectPlan,
  isLoading 
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <motion.div
          key={plan.name}
          whileHover={{ scale: 1.02 }}
          className={cn(
            "relative rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md",
            currentPlan?.name === plan.name && "border-primary"
          )}
        >
          {currentPlan?.name === plan.name && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Current Plan
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={currentPlan?.name === plan.name ? "outline" : "default"}
              disabled={isLoading || currentPlan?.name === plan.name}
              onClick={() => onSelectPlan(plan.name)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentPlan?.name === plan.name ? (
                'Current Plan'
              ) : (
                'Select Plan'
              )}
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 