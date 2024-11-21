import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cardVariants, listItemVariants } from '@/config/animations';
import { AccountPageLayout } from '@/layout/AccountPageLayout';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  UploadCloud,
  Zap,
} from 'lucide-react';

const features = [
  { icon: Zap, text: '10,000 API calls per month' },
  { icon: UploadCloud, text: '5GB storage' },
  { icon: CheckCircle2, text: 'Priority support' },
  { icon: CreditCard, text: 'Custom billing options' },
];

const billingHistory = [
  { date: 'April 1, 2024', amount: 29.0 },
  { date: 'March 1, 2024', amount: 29.0 },
  { date: 'February 1, 2024', amount: 29.0 },
];

export function AccountSubscriptionPage() {
  return (
    <AccountPageLayout title="Subscription">
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
            <Card className="account-card">
              <div className="scroll-container">
                <div className="scroll-content">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="mb-2">
                        Current Plan
                      </Badge>
                      <h2 className="text-2xl font-semibold">Pro Plan</h2>
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
                        <span className="text-sm text-muted-foreground">
                          8,543/10,000
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </motion.div>

                    <motion.div variants={listItemVariants}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Storage</span>
                        <span className="text-sm text-muted-foreground">
                          4.2GB/5GB
                        </span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </motion.div>
                  </div>

                  <Alert className="mt-4 bg-primary/5 border-primary/10">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle>Usage Alert</AlertTitle>
                    <AlertDescription>
                      You're approaching your API calls limit. Consider
                      upgrading your plan.
                    </AlertDescription>
                  </Alert>

                  <div className="account-button-group mt-6">
                    <Button className="account-hover-effect gap-2">
                      Upgrade Plan
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">Cancel Subscription</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Plan Features */}
            <Card className="account-card">
              <div className="scroll-container">
                <div className="scroll-content">
                  <h2 className="account-section-title">Plan Features</h2>
                  <motion.div
                    variants={listItemVariants}
                    className="grid gap-4"
                  >
                    {features.map((feature, i) => (
                      <motion.div
                        key={i}
                        variants={listItemVariants}
                        custom={i}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <feature.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="account-card">
              <div className="scroll-container">
                <div className="scroll-content">
                  <h2 className="account-section-title">Payment Method</h2>
                  <motion.div variants={listItemVariants} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg account-card-hover">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">•••• 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 04/2024
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>

            {/* Billing History */}
            <Card className="account-card">
              <div className="scroll-container">
                <div className="scroll-content">
                  <h2 className="account-section-title">Billing History</h2>
                  <motion.div variants={listItemVariants} className="space-y-4">
                    {billingHistory.map((bill, i) => (
                      <motion.div
                        key={i}
                        variants={listItemVariants}
                        custom={i}
                        className="flex items-center justify-between p-4 border rounded-lg account-card-hover"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Pro Plan - Monthly</p>
                            <p className="text-sm text-muted-foreground">
                              {bill.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            ${bill.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-primary transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AccountPageLayout>
  );
}

export default AccountSubscriptionPage;
