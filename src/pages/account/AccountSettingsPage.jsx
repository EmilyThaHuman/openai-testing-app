import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  Key,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Trash2,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const settingsSections = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your account settings and preferences',
    settings: [
      {
        id: 'apiKey',
        label: 'OpenAI API Key',
        description: 'Your OpenAI API key for accessing AI features',
        type: 'password',
      },
      {
        id: 'language',
        label: 'Language',
        description: 'Select your preferred language',
        type: 'select',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of the application',
    settings: [
      {
        id: 'theme',
        label: 'Theme',
        description: 'Choose between light and dark mode',
        type: 'theme',
      },
      {
        id: 'animations',
        label: 'Enable Animations',
        description: 'Toggle UI animations and transitions',
        type: 'switch',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure how you receive notifications',
    settings: [
      {
        id: 'emailNotifications',
        label: 'Email Notifications',
        description: 'Receive important updates via email',
        type: 'switch',
      },
      {
        id: 'pushNotifications',
        label: 'Push Notifications',
        description: 'Get instant notifications in your browser',
        type: 'switch',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your security preferences',
    settings: [
      {
        id: 'twoFactor',
        label: 'Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        type: 'switch',
      },
      {
        id: 'sessionTimeout',
        label: 'Session Timeout',
        description: 'Automatically log out after period of inactivity',
        type: 'select',
        options: [
          { value: '15', label: '15 minutes' },
          { value: '30', label: '30 minutes' },
          { value: '60', label: '1 hour' },
        ],
      },
    ],
  },
]

export function AccountSettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const {
    apiKey,
    setApiKey,
    settings,
    updateSettings,
  } = useStore(state => ({
    apiKey: state.apiKey,
    setApiKey: state.setApiKey,
    settings: state.settings,
    updateSettings: state.updateSettings,
  }))

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateSettings(settings)
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      toast({
        title: 'Error',
        description: 'Please enter your email to confirm account deletion',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // Add account deletion logic here
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      })
      setShowDeleteDialog(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-4xl py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {settingsSections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex flex-col space-y-2">
                  <Label htmlFor={setting.id}>{setting.label}</Label>
                  <div className="flex items-center gap-4">
                    {setting.type === 'password' && (
                      <div className="flex-1 relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={setting.id}
                          type="password"
                          value={apiKey || ''}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pl-9"
                          placeholder="Enter your API key"
                        />
                      </div>
                    )}

                    {setting.type === 'select' && (
                      <Select
                        value={settings?.[setting.id]}
                        onValueChange={(value) =>
                          updateSettings({ [setting.id]: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {setting.type === 'theme' && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setTheme(theme === 'light' ? 'dark' : 'light')
                        }
                      >
                        {theme === 'light' ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {setting.type === 'switch' && (
                      <Switch
                        id={setting.id}
                        checked={settings?.[setting.id]}
                        onCheckedChange={(checked) =>
                          updateSettings({ [setting.id]: checked })
                        }
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-muted-foreground">
              Permanent actions that cannot be undone
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please type your email address to confirm deletion:
              <span className="font-mono ml-2">{user?.email}</span>
            </AlertDescription>
          </Alert>

          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Enter your email"
            className="mt-2"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading || deleteConfirmation !== user?.email}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default AccountSettingsPage 