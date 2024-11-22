import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useOpenAI } from 'archive/OpenAIContext';
import { motion } from 'framer-motion';
import { Code, Key, Palette, Settings, User } from 'lucide-react';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { apiKey, updateApiKey } = useOpenAI();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      updates: false,
    },
    appearance: {
      theme: theme,
      reduceMotion: false,
      fontSize: '14px',
    },
    editor: {
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      lineNumbers: true,
    },
    privacy: {
      shareAnalytics: true,
      shareUsage: false,
    },
    apiSettings: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
    },
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // Save settings to user profile
      await updateProfile({
        settings: settings,
      });

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: error.message,
      });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container max-w-4xl py-8"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-8"
      >
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="account" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-2">
            <Code className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="w-4 h-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user?.email} disabled />
                  <Badge variant="secondary" className="mt-1">
                    Verified
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your account
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={checked =>
                          handleSettingChange('notifications', 'email', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={checked =>
                          handleSettingChange('notifications', 'push', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {['light', 'dark', 'system'].map(t => (
                      <Button
                        key={t}
                        variant={theme === t ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme(t)}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Motion and animations */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.reduceMotion}
                    onCheckedChange={checked =>
                      handleSettingChange('appearance', 'reduceMotion', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Editor Settings</CardTitle>
              <CardDescription>
                Customize your coding environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tab Size</Label>
                    <Input
                      type="number"
                      min="1"
                      max="8"
                      value={settings.editor.tabSize}
                      onChange={e =>
                        handleSettingChange(
                          'editor',
                          'tabSize',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Input
                      type="text"
                      value={settings.appearance.fontSize}
                      onChange={e =>
                        handleSettingChange(
                          'appearance',
                          'fontSize',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Word Wrap</Label>
                      <p className="text-sm text-muted-foreground">
                        Wrap long lines of code
                      </p>
                    </div>
                    <Switch
                      checked={settings.editor.wordWrap}
                      onCheckedChange={checked =>
                        handleSettingChange('editor', 'wordWrap', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Minimap</Label>
                      <p className="text-sm text-muted-foreground">
                        Show code overview on the side
                      </p>
                    </div>
                    <Switch
                      checked={settings.editor.minimap}
                      onCheckedChange={checked =>
                        handleSettingChange('editor', 'minimap', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Manage your API keys and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={e => updateApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="font-mono"
                    />
                    <Button variant="outline">Verify</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Default Parameters</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={settings.apiSettings.model}
                        onChange={e =>
                          handleSettingChange(
                            'apiSettings',
                            'model',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Temperature</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.apiSettings.temperature}
                        onChange={e =>
                          handleSettingChange(
                            'apiSettings',
                            'temperature',
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} className="gap-2">
          <Settings className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}

export default SettingsPage;
