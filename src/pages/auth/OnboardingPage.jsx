import React, { useState } from 'react';
import {
  User,
  Settings,
  Briefcase,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
  Code2,
  Server,
  Database,
  StarIcon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFormContext } from 'react-hook-form';
import { GitHubIcon } from '@/assets/humanIcons';
import { IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    profile: {
      username: '',
      displayName: '',
      profileContext: '',
      applyContext: false,
      bio: '',
      socialLinks: {
        github: '',
        twitter: '',
        linkedin: '',
      },
      avatar: 1,
    },
    ai: {
      openaiKey: '',
      anthropicKey: '',
      modelInstructions: '',
      assistantInstructions: '',
    },
    workspace: {
      context: '',
      frontendStack: [],
      backendStack: [],
      databases: [],
    },
    account: {
      plan: 'free',
    },
    review: false,
  });

  const steps = [
    {
      title: 'Profile Setup',
      icon: <User className="w-6 h-6" />,
      component: <ProfileStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'AI Configuration',
      icon: <Settings className="w-6 h-6" />,
      component: <AIStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Workspace',
      icon: <Briefcase className="w-6 h-6" />,
      component: (
        <WorkspaceStep formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: 'Account',
      icon: <CreditCard className="w-6 h-6" />,
      component: <AccountStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Review',
      icon: <CheckCircle2 className="w-6 h-6" />,
      component: <FinalReviewStep />,
    },  
  ];

  const nextStep = () =>
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full
                ${
                  currentStep >= index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-24 mx-2 
                  ${currentStep > index ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <Card className="w-full p-6 shadow-lg transition-all duration-300 transform">
          <CardHeader>
            <div className="flex items-center space-x-2">
              {steps[currentStep].icon}
              <CardTitle className="text-2xl font-bold">
                {steps[currentStep].title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {steps[currentStep].component}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            <Button onClick={nextStep} className="flex items-center space-x-2">
              <span>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ProfileStep = ({ formData, setFormData }) => {
  const avatarOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const updateProfile = (field, value) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input
            placeholder="Enter username"
            value={formData.profile.username}
            onChange={e => updateProfile('username', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <Input
            placeholder="Enter display name"
            value={formData.profile.displayName}
            onChange={e => updateProfile('displayName', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Profile Context</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This context will be used to personalize your experience</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          placeholder="Enter profile context..."
          value={formData.profile.profileContext}
          onChange={e => updateProfile('profileContext', e.target.value)}
          className="h-24"
        />
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.profile.applyContext}
            onCheckedChange={checked => updateProfile('applyContext', checked)}
          />
          <label className="text-sm text-gray-600">
            Apply context to all conversations
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Bio</label>
        <Textarea
          placeholder="Tell us about yourself..."
          value={formData.profile.bio}
          onChange={e => updateProfile('bio', e.target.value)}
          className="h-24"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Social Links</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <GitHubIcon className="w-5 h-5" />
            <Input
              placeholder="GitHub username"
              value={formData.profile.socialLinks.github}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    socialLinks: {
                      ...prev.profile.socialLinks,
                      github: e.target.value,
                    },
                  },
                }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <IconBrandTwitter className="w-5 h-5" />
            <Input
              placeholder="Twitter username"
              value={formData.profile.socialLinks.twitter}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    socialLinks: {
                      ...prev.profile.socialLinks,
                      twitter: e.target.value,
                    },
                  },
                }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <IconBrandLinkedin className="w-5 h-5" />
            <Input
              placeholder="LinkedIn profile"
              value={formData.profile.socialLinks.linkedin}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    socialLinks: {
                      ...prev.profile.socialLinks,
                      linkedin: e.target.value,
                    },
                  },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Choose Avatar</label>
        <div className="grid grid-cols-6 gap-4">
          {avatarOptions.map(id => (
            <button
              key={id}
              onClick={() => updateProfile('avatar', id)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                formData.profile.avatar === id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={`/api/placeholder/48/48`}
                alt={`Avatar ${id}`}
                className="w-12 h-12 rounded-full"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AIStep = ({ formData, setFormData }) => {
  const updateAI = (field, value) => {
    setFormData(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          Your API keys are securely encrypted and stored. We never share your
          keys with third parties.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">OpenAI API Key</label>
            <Badge variant="outline" className="text-xs">
              Recommended
            </Badge>
          </div>
          <Input
            type="password"
            placeholder="sk-..."
            value={formData.ai.openaiKey}
            onChange={e => updateAI('openaiKey', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Anthropic API Key</label>
          <Input
            type="password"
            placeholder="sk-ant-..."
            value={formData.ai.anthropicKey}
            onChange={e => updateAI('anthropicKey', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Default Model Instructions
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>These instructions will be used as default system message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          placeholder="Enter default instructions for AI models..."
          value={formData.ai.modelInstructions}
          onChange={e => updateAI('modelInstructions', e.target.value)}
          className="h-32"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Default Assistant Instructions
        </label>
        <Textarea
          placeholder="Enter default instructions for AI assistants..."
          value={formData.ai.assistantInstructions}
          onChange={e => updateAI('assistantInstructions', e.target.value)}
          className="h-32"
        />
      </div>
    </div>
  );
};

const WorkspaceStep = ({ formData, setFormData }) => {
  const updateWorkspace = (field, value) => {
    setFormData(prev => ({
      ...prev,
      workspace: {
        ...prev.workspace,
        [field]: value,
      },
    }));
  };

  const frontendOptions = ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'];
  const backendOptions = ['Node.js', 'Python', 'Java', 'Go', 'Ruby'];
  const databaseOptions = [
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Firebase',
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Workspace Context</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This context will be applied to your workspace environment
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          placeholder="Enter workspace context..."
          value={formData.workspace.context}
          onChange={e => updateWorkspace('context', e.target.value)}
          className="h-24"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Frontend Stack</label>
        <div className="flex flex-wrap gap-2">
          {frontendOptions.map(option => (
            <Button
              key={option}
              variant={
                formData.workspace.frontendStack.includes(option)
                  ? 'default'
                  : 'outline'
              }
              onClick={() => {
                const selected =
                  formData.workspace.frontendStack.includes(option);
                updateWorkspace(
                  'frontendStack',
                  selected
                    ? formData.workspace.frontendStack.filter(
                        item => item !== option
                      )
                    : [...formData.workspace.frontendStack, option]
                );
              }}
              className="cursor-pointer"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Backend Stack</label>
        <div className="flex flex-wrap gap-2">
          {backendOptions.map(option => (
            <Button
              key={option}
              variant={
                formData.workspace.backendStack.includes(option)
                  ? 'default'
                  : 'outline'
              }
              onClick={() => {
                const selected =
                  formData.workspace.backendStack.includes(option);
                updateWorkspace(
                  'backendStack',
                  selected
                    ? formData.workspace.backendStack.filter(
                        item => item !== option
                      )
                    : [...formData.workspace.backendStack, option]
                );
              }}
              className="cursor-pointer"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Databases</label>
        <div className="flex flex-wrap gap-2">
          {databaseOptions.map(option => (
            <Button
              key={option}
              variant={
                formData.workspace.databases.includes(option)
                  ? 'default'
                  : 'outline'
              }
              onClick={() => {
                const selected = formData.workspace.databases.includes(option);
                updateWorkspace(
                  'databases',
                  selected
                    ? formData.workspace.databases.filter(
                        item => item !== option
                      )
                    : [...formData.workspace.databases, option]
                );
              }}
              className="cursor-pointer"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AccountStep = ({ formData, setFormData }) => {
  const updateAccount = (field, value) => {
    setFormData(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [field]: value,
      },
    }));
  };

  const planOptions = [
    { id: 'free', name: 'Free', price: '$0/mo', features: ['Basic features'] },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9/mo',
      features: ['Advanced features', 'Priority support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Contact us',
      features: ['All features', 'Dedicated support'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium">Select Plan</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planOptions.map(plan => (
            <Card
              key={plan.id}
              className={`p-4 border cursor-pointer ${formData.account.plan === plan.id ? 'border-blue-500' : 'border-gray-200'}`}
              onClick={() => updateAccount('plan', plan.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {formData.account.plan === plan.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <p className="text-xl font-bold">{plan.price}</p>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Final Review Step Component
export function FinalReviewStep() {
  const { watch } = useFormContext();
  const formData = watch();

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <CardTitle>Review Your Setup</CardTitle>
          </div>
          <CardDescription>
            Review and confirm your configuration before finishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Almost there!
            </AlertTitle>
            <AlertDescription>
              Please review your settings below before completing the setup.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Workspace Configuration</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Frontend: {formData?.workspace?.frontend || 'Not selected'}
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Backend: {formData?.workspace?.backend || 'Not selected'}
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database: {formData?.workspace?.database || 'Not selected'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Selected Plan</h3>
              <div className="p-4 rounded-lg bg-primary/5 border">
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="w-4 h-4 text-primary" />
                  {formData?.account?.plan || 'Free Plan'}
                </div>
                <p className="text-sm text-muted-foreground">
                  You can change your plan at any time from your account settings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingWizard;
