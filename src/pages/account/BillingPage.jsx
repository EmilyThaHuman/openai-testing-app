import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
}

const plans = [
  {
    name: 'Basic',
    price: '99',
    description: 'Perfect for individuals and small projects.',
    features: [
      '100 AI generations per month',
      'Basic text-to-image conversion',
      'Email support',
      'Access to community forum'
    ]
  },
  {
    name: 'Pro',
    price: '290',
    description: 'Ideal for professionals and growing businesses.',
    features: [
      '1000 AI generations per month',
      'Advanced text-to-image conversion',
      'Priority email support',
      'API access',
      'Custom AI model fine-tuning',
      'Collaboration tools'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for large organizations.',
    isPopular: true,
    features: [
      'Unlimited AI generations',
      'Dedicated account manager',
      '24/7 phone and email support',
      'Custom AI model development',
      'On-premises deployment option',
      'Advanced analytics and reporting'
    ]
  }
]

export function BillingPage() {
  const [billingCycle, setBillingCycle] = useState('yearly')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center">
        <h2 className="text-base font-semibold tracking-wider text-muted-foreground uppercase">
          Pricing
        </h2>
        <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Simple pricing for everyone.
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose an <span className="font-semibold">affordable plan</span> that&apos;s packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
        </p>
        
        <div className="mt-6 flex justify-center">
          <div className="relative inline-flex rounded-full shadow-sm">
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'outline'}
              className="rounded-l-full"
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <Badge variant="success" className="ml-2">Save 25%</Badge>
            </Button>
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              className="rounded-r-full"
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            variants={itemVariants}
            className="relative"
          >
            <Card className={cn(
              "p-6",
              "bg-card border-border/50",
              "hover:border-primary/50 transition-colors"
            )}>
              {plan.isPopular && (
                <Badge
                  variant="purple"
                  className="absolute top-4 right-4"
                >
                  Most Popular
                </Badge>
              )}
              
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-4 text-4xl font-extrabold">
                ${plan.price}
                <span className="text-base font-medium text-muted-foreground">
                  /{billingCycle}
                </span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-1" />
                    <p className="ml-3 text-sm text-muted-foreground">
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className="w-full"
                  variant={plan.isPopular ? 'purple' : 'secondary'}
                >
                  Get Started
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default BillingPage
