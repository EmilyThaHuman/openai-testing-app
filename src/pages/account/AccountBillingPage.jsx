import React from 'react'
import { AccountPageLayout } from '@/components/account/AccountPageLayout'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Download, 
  History, 
  ArrowRight, 
  Plus,
  AlertCircle,
  Wallet,
  Receipt,
  CreditCard as CardIcon,
  DollarSign,
  Clock
} from 'lucide-react'
import { cardVariants, listItemVariants } from '@/config/animations'
import { cn } from '@/lib/utils'

// Enhanced card component with hover effects
const BillingCard = ({ className, children, ...props }) => {
  return (
    <motion.div
      className={cn(
        "group relative rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-500",
        "bg-background/95 backdrop-blur-sm shadow-sm hover:shadow-lg",
        className
      )}
      whileHover={{ scale: 1.005 }}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Enhanced section component
const BillingSection = ({ icon: Icon, title, description, children }) => (
  <motion.div
    variants={listItemVariants}
    className="space-y-4"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="pl-12">
      {children}
    </div>
  </motion.div>
)

export function AccountBillingPage() {
  return (
    <AccountPageLayout title="Billing & Usage">
      <div className="responsive-layout">
        <div className="responsive-container">
          <motion.div 
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="responsive-content"
          >
            {/* Current Plan */}
            <BillingCard className="p-8">
              <BillingSection
                icon={Wallet}
                title="Current Plan"
                description="Your current subscription and usage details"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Pro Plan
                      </h2>
                      <p className="text-muted-foreground">$29/month</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <motion.div variants={listItemVariants}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">API Calls</span>
                        <span className="text-sm text-muted-foreground">8,543/10,000</span>
                      </div>
                      <div className="relative">
                        <Progress value={85} className="h-2" />
                        <div className="absolute -top-1 left-[85%] w-0.5 h-4 bg-yellow-500/50 animate-pulse" />
                      </div>
                    </motion.div>

                    <motion.div variants={listItemVariants}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Storage</span>
                        <span className="text-sm text-muted-foreground">4.2GB/5GB</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </motion.div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button 
                      className="relative overflow-hidden group"
                      variant="default"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Upgrade Plan
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      />
                    </Button>
                    <Button variant="outline">Cancel Subscription</Button>
                  </div>
                </div>
              </BillingSection>
            </BillingCard>

            {/* Payment Methods */}
            <BillingCard className="p-8">
              <BillingSection
                icon={CardIcon}
                title="Payment Methods"
                description="Manage your payment methods and billing preferences"
              >
                <motion.div 
                  variants={listItemVariants}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">•••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 04/2024</p>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2 hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </motion.div>
              </BillingSection>
            </BillingCard>

            {/* Billing History */}
            <BillingCard className="p-8">
              <BillingSection
                icon={Receipt}
                title="Billing History"
                description="View and download your past invoices"
              >
                <motion.div 
                  variants={listItemVariants}
                  className="space-y-4"
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      variants={listItemVariants}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Pro Plan - Monthly</p>
                          <p className="text-sm text-muted-foreground">April {i}, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">$29.00</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:text-primary hover:scale-110 transition-all duration-300"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </BillingSection>
            </BillingCard>
          </motion.div>
        </div>
      </div>
    </AccountPageLayout>
  )
}

export default AccountBillingPage 