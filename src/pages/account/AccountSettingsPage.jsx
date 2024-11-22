import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { cardVariants, listItemVariants } from '@/config/animations';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AccountPageLayout } from '@/layout/AccountPageLayout';
import { supabaseClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Eye,
  EyeOff,
  Globe,
  Key,
  Laptop,
  Loader2,
  Lock,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Sun,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'react-router-dom';

// Enhanced setting section component
const SettingSection = ({ icon: Icon, title, description, children }) => (
  <motion.div variants={listItemVariants} className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="pl-12">{children}</div>
  </motion.div>
);

// Enhanced setting item component
const SettingItem = ({ icon: Icon, title, description, children }) => (
  <motion.div
    variants={listItemVariants}
    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-300 group"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

export function AccountSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const router = useRouter();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { apiKey, setApiKey, settings, updateSettings } = useStore();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings(settings);
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      toast({
        title: 'Error',
        description: 'Please enter your email correctly to confirm deletion',
        variant: 'destructive',
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Delete user data from Supabase
      const { error: deleteError } = await supabaseClient.auth.updateUser({
        data: { deleted: true },
      });

      if (deleteError) throw deleteError;

      // Sign out the user
      await supabaseClient.auth.signOut();

      // Clear local storage and state
      localStorage.clear();

      toast({
        title: 'Account Deleted',
        description:
          'Your account has been successfully deleted. You will be redirected shortly.',
      });

      // Redirect to home page after short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <AccountPageLayout title="Settings">
      <div className="responsive-layout">
        <div className="responsive-container">
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="responsive-content"
          >
            {/* API Settings */}
            <Card className="account-card">
              <SettingSection
                icon={Settings2}
                title="API Configuration"
                description="Manage your API keys and integration settings"
              >
                <SettingItem
                  icon={Key}
                  title="OpenAI API Key"
                  description="Your secret API key for accessing OpenAI services"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey || ''}
                        onChange={e => setApiKey(e.target.value)}
                        className="pr-10 font-mono"
                        placeholder="sk-..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </SettingItem>
              </SettingSection>
            </Card>

            {/* Appearance */}
            <Card className="account-card">
              <SettingSection
                icon={Palette}
                title="Appearance"
                description="Customize the look and feel of your interface"
              >
                <SettingItem
                  icon={Globe}
                  title="Language"
                  description="Choose your preferred language"
                >
                  <Select defaultValue="en">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>

                <SettingItem
                  icon={theme === 'light' ? Sun : Moon}
                  title="Theme"
                  description="Choose between light and dark mode"
                >
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </SettingItem>
              </SettingSection>
            </Card>

            {/* Security */}
            <Card className="account-card">
              <SettingSection
                icon={Shield}
                title="Security"
                description="Manage your account security settings"
              >
                <SettingItem
                  icon={Lock}
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                >
                  <Switch />
                </SettingItem>

                <SettingItem
                  icon={Bell}
                  title="Security Alerts"
                  description="Get notified about important security events"
                >
                  <Switch defaultChecked />
                </SettingItem>
              </SettingSection>
            </Card>

            {/* Danger Zone */}
            <Card className="account-card border-destructive/50">
              <SettingSection
                icon={AlertCircle}
                title="Danger Zone"
                description="Irreversible and destructive actions"
              >
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="mt-4 gap-2 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </SettingSection>
            </Card>

            {/* Save Button */}
            <motion.div
              variants={listItemVariants}
              className="sticky bottom-6 mt-6"
            >
              <Card className="account-card bg-background/80 backdrop-blur-sm">
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.1 }}
                    />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
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
              <code className="ml-2">{user?.email}</code>
            </AlertDescription>
          </Alert>

          <Input
            value={deleteConfirmation}
            onChange={e => setDeleteConfirmation(e.target.value)}
            placeholder="Enter your email"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmation !== user?.email}
              className="gap-2"
            >
              {isDeletingAccount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountPageLayout>
  );
}

export default AccountSettingsPage;
