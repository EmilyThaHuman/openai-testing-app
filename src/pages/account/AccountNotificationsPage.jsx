import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, MessageSquare, Star, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-4xl py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>

      <Card className="p-6 space-y-8">
        <div className="space-y-6">
          {notificationSettings.map((setting) => {
            const Icon = setting.icon
            return (
              <div
                key={setting.id}
                className="flex items-center justify-between space-x-4"
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
                <Switch id={setting.id} defaultChecked />
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </motion.div>
  )
}

export default AccountNotificationsPage 