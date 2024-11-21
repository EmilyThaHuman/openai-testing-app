import React from 'react'
import { AccountPageLayout } from '@/components/account/AccountPageLayout'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, MessageSquare, Star, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cardVariants, listItemVariants } from '@/config/animations'

const notificationSettings = [
  {
    id: 'email-notifications',
    title: 'Email Notifications',
    description: 'Receive email notifications for important updates',
    icon: Mail,
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    description: 'Get instant notifications in your browser',
    icon: Bell,
  },
  {
    id: 'chat-notifications',
    title: 'Chat Notifications',
    description: 'Notifications for new chat messages',
    icon: MessageSquare,
  },
  {
    id: 'feature-updates',
    title: 'Feature Updates',
    description: 'Stay informed about new features and improvements',
    icon: Star,
  },
  {
    id: 'usage-alerts',
    title: 'Usage Alerts',
    description: 'Get notified when approaching usage limits',
    icon: Zap,
  },
]

export function AccountNotificationsPage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your notification preferences have been updated',
    })
  }

  return (
    <AccountPageLayout title="Notification Settings">
      <div className="responsive-layout">
        <div className="responsive-container">
          <motion.div 
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="responsive-content"
          >
            <Card className="account-card">
              <div className="scroll-container">
                <div className="scroll-content space-y-6">
                  {notificationSettings.map((setting, index) => {
                    const Icon = setting.icon
                    return (
                      <motion.div
                        key={setting.id}
                        variants={listItemVariants}
                        custom={index}
                        className="flex items-center justify-between p-4 rounded-lg card-glass hover:card-highlight"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={setting.id} className="text-base">
                              {setting.title}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={setting.id}
                          defaultChecked
                          className="data-[state=checked]:bg-primary"
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="account-button-group mt-8">
                <Button variant="outline" className="hover-glow">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="account-hover-effect gradient-border"
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AccountPageLayout>
  )
}

export default AccountNotificationsPage 