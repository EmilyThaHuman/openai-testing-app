import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Lock,
  Rocket,
  Settings,
} from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    icon: Lock,
  },
  {
    id: 'preferences',
    title: 'AI Preferences',
    icon: Brain,
  },
  {
    id: 'settings',
    title: 'App Settings',
    icon: Settings,
  },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatar_url: '',
    aiModel: 'gpt-4',
    theme: 'system',
    notifications: true,
  });

  // Fetch existing profile data if available
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Ignore "Row not found" error (code PGRST116)
        toast({
          title: 'Error fetching profile',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setFormData({
          displayName: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          aiModel: data.ai_model || 'gpt-4',
          theme: data.theme || 'system',
          notifications: data.notifications ?? true,
        });
      }
      setIsLoading(false);
    }

    fetchProfile();
  }, [user.id, toast]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setIsLoading(true);
      try {
        // Update user profile in Supabase
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          display_name: formData.displayName,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          ai_model: formData.aiModel,
          theme: formData.theme,
          notifications: formData.notifications,
          updated_at: new Date(),
        });

        if (error) {
          throw error;
        }

        toast({
          title: 'Setup complete!',
          description: 'Welcome to AI Playground',
        });
        navigate('/dashboard');
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-6">
              <Avatar className="w-24 h-24">
                {formData.avatar_url ? (
                  <AvatarImage src={formData.avatar_url} alt="Avatar" />
                ) : (
                  <AvatarFallback>
                    {formData.displayName?.charAt(0) || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            {/* File input for avatar upload */}
            <div className="space-y-2">
              <Label htmlFor="avatar">Upload Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={e =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="How should we call you?"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                disabled={isLoading}
              />
            </div>
          </motion.div>
        );
      case 'preferences':
        return (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>Preferred AI Model</Label>
              <div className="grid grid-cols-2 gap-4">
                {['gpt-4', 'gpt-3.5-turbo'].map(model => (
                  <Button
                    key={model}
                    variant={formData.aiModel === model ? 'default' : 'outline'}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setFormData({ ...formData, aiModel: model })}
                    disabled={isLoading}
                  >
                    <Brain className="h-6 w-6" />
                    <span>{model.toUpperCase()}</span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>Theme Preference</Label>
              <div className="grid grid-cols-3 gap-4">
                {['light', 'dark', 'system'].map(theme => (
                  <Button
                    key={theme}
                    variant={formData.theme === theme ? 'default' : 'outline'}
                    className="h-20"
                    onClick={() => setFormData({ ...formData, theme: theme })}
                    disabled={isLoading}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="notifications">Notifications</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      notifications: e.target.checked,
                    })
                  }
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <Label htmlFor="notifications">
                  Enable email notifications
                </Label>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handleAvatarUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { publicURL, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      setFormData({ ...formData, avatar_url: publicURL });
    } catch (error) {
      toast({
        title: 'Avatar Upload Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div className="space-y-4 text-center">
          {React.createElement(steps[currentStep].icon, {
            className: 'w-12 h-12 mx-auto text-primary',
          })}
          <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext} disabled={isLoading}>
            {currentStep === steps.length - 1 ? (
              isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Get Started
                  <Rocket className="ml-2 h-4 w-4" />
                </>
              )
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
