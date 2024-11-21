import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Download, 
  UploadCloud, 
  Zap 
} from 'lucide-react'

export function AccountSubscriptionPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-4xl py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Subscription</h1>

      {/* Current Plan */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Badge variant="secondary" className="mb-2">Current Plan</Badge>
            <h2 className="text-2xl font-semibold">Pro Plan</h2>
            <p className="text-muted-foreground">$29/month</p>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            Active
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">API Calls</span>
              <span className="text-sm text-muted-foreground">8,543/10,000</span>
            </div>
            <Progress value={85} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-sm text-muted-foreground">4.2GB/5GB</span>
            </div>
            <Progress value={84} />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Button variant="outline">Change Plan</Button>
          <Button variant="destructive">Cancel Subscription</Button>
        </div>
      </Card>

      {/* Plan Features */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Plan Features</h2>
        <div className="grid gap-4">
          {[
            { icon: Zap, text: '10,000 API calls per month' },
            { icon: UploadCloud, text: '5GB storage' },
            { icon: CheckCircle2, text: 'Priority support' },
            { icon: CreditCard, text: 'Custom billing options' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 text-primary" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <CreditCard className="h-6 w-6" />
            <div>
              <p className="font-medium">•••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 04/2024</p>
            </div>
          </div>
          <Button variant="outline">Update</Button>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">April {i}, 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">$29.00</span>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

export default AccountSubscriptionPage 