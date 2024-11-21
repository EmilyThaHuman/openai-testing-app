import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { AppIcon } from '@/components/ui/AppIcon'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { 
  RocketIcon, 
  WrenchIcon, 
  CreditCardIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  UploadIcon, 
  CheckIcon, 
  Loader2Icon,
  SettingsIcon,
  CodeIcon,
  ZapIcon,
  PaletteIcon,
  BoxIcon,
  CpuIcon,
  CloudIcon,
  LockIcon,
  ShieldIcon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOpenAI } from '@/context/OpenAIContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'


// Constants and Schemas
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const stepSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal(1),
    workspaceName: z.string().min(2, 'Workspace name is required'),
    workspaceContext: z.string(),
    workspaceAvatar: z.string(),
    theme: z.string(),
    defaultModel: z.string()
  }),
  z.object({
    step: z.literal(2),
    modelPresets: z.array(z.any()).optional(),
    toolDefinitions: z.string(),
    actionPlugins: z.array(z.any()).optional(),
    apiKey: z.string().optional(),
    enableAdvancedFeatures: z.boolean().optional()
  }),
  z.object({
    step: z.literal(3),
    isPro: z.boolean(),
    enableNotifications: z.boolean().optional(),
    dataCollection: z.boolean().optional(),
    newsletter: z.boolean().optional()
  })
])

const steps = [
  { 
    title: 'Workspace Setup',
    description: 'Configure your development environment',
    icon: RocketIcon,
    color: 'text-blue-500'
  },
  { 
    title: 'API Configuration',
    description: 'Set up your OpenAI integration',
    icon: WrenchIcon,
    color: 'text-green-500'
  },
  { 
    title: 'Finalize Setup',
    description: 'Choose your preferences',
    icon: CreditCardIcon,
    color: 'text-purple-500'
  }
]

const themes = [
  { value: 'system', label: 'System', icon: SettingsIcon },
  { value: 'light', label: 'Light', icon: PaletteIcon },
  { value: 'dark', label: 'Dark', icon: BoxIcon }
]

const models = [
  { value: 'gpt-4', label: 'GPT-4', icon: CpuIcon },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', icon: ZapIcon },
  { value: 'claude-3', label: 'Claude 3', icon: CloudIcon }
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
}

// Continue in next part...

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { checkAuth } = useAuth()
  const { updateApiKey } = useOpenAI()
  const supabase = useSupabaseClient()

  const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      step: currentStep,
      workspaceName: '',
      workspaceContext: '',
      workspaceAvatar: 'default',
      theme: 'system',
      defaultModel: 'gpt-4',
      modelPresets: [],
      toolDefinitions: '',
      actionPlugins: [],
      apiKey: '',
      enableAdvancedFeatures: false,
      isPro: false,
      enableNotifications: true,
      dataCollection: false,
      newsletter: false
    }
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/json': ['.json'],
      'text/javascript': ['.js', '.ts']
    },
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles) => {
      // Handle file upload logic
      console.log('Accepted files:', acceptedFiles)
    }
  })

  const stepContent = {
    1: (
      <motion.div
        key="step1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <RocketIcon className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Workspace Setup</h2>
              <p className="text-muted-foreground">Configure your development environment</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Controller
                name="workspaceName"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field}
                    className="transition-all focus:scale-[1.01]"
                    placeholder="My Workspace"
                  />
                )}
              />
              {errors.workspaceName && (
                <p className="text-sm text-destructive">{errors.workspaceName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspaceContext">Description</Label>
              <Controller
                name="workspaceContext"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="min-h-[100px] transition-all focus:scale-[1.01]"
                    placeholder="Describe your workspace's purpose..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Controller
                name="theme"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Model</Label>
              <Controller
                name="defaultModel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    ),

    2: (
      <motion.div
        key="step2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <WrenchIcon className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">API Configuration</h2>
              <p className="text-muted-foreground">Set up your API integrations</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Controller
                name="apiKey"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    className="font-mono transition-all focus:scale-[1.01]"
                    placeholder="sk-..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Model Presets</Label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <input {...getInputProps()} />
                <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Drag & drop model preset files here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JSON files up to 10MB
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Advanced Features</Label>
                <p className="text-sm text-muted-foreground">
                  Enable experimental features and tools
                </p>
              </div>
              <Controller
                name="enableAdvancedFeatures"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    ),

    3: (
      <motion.div
        key="step3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="flex items-center space-x-4">
            <CreditCardIcon className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Finalize Setup</h2>
              <p className="text-muted-foreground">Choose your preferences</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Pro Account</h3>
                <p className="text-sm text-muted-foreground">
                  Get access to advanced features and priority support
                </p>
              </div>
              <Controller
                name="isPro"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and alerts
                  </p>
                </div>
                <Controller
                  name="enableNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the platform
                  </p>
                </div>
                <Controller
                  name="dataCollection"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const onSubmit = async (data) => {
    try {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) throw new Error('No authenticated user found')

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          settings: {
            theme: data.theme,
            defaultModel: data.defaultModel,
            isPro: data.isPro,
            enableNotifications: data.enableNotifications,
            dataCollection: data.dataCollection
          }
        })
        .eq('id', session.user.id)

      if (profileError) throw profileError

      // Create workspace
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          user_id: session.user.id,
          name: data.workspaceName,
          context: data.workspaceContext
        })

      if (workspaceError) throw workspaceError

      // Save API key if provided
      if (data.apiKey) {
        // Implement secure API key storage
        // This should be properly encrypted/secured
      }

      toast({
        title: 'Setup complete!',
        description: 'Your workspace is ready to use.'
      })

      // Force auth context to refresh
      await checkAuth()

      navigate('/open-canvas', { 
        replace: true,
        state: { 
          from: '/auth/onboarding',
          isNewUser: true 
        }
      })

    } catch (error) {
      console.error('Setup failed:', error)
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: error.message
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <AppIcon size="xl" className="animate-float" />
              </motion.div>
              
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">
                  {steps[currentStep - 1].title}
                </h1>
                <p className="text-muted-foreground">
                  Step {currentStep} of 3 - {steps[currentStep - 1].description}
                </p>
              </div>

              <div className="flex justify-between w-full max-w-md mt-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: index + 1 <= currentStep ? 'var(--primary)' : 'var(--secondary)',
                        scale: index + 1 === currentStep ? 1.1 : 1
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    >
                      {index + 1 < currentStep ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 w-full mx-2 ${
                          index + 1 < currentStep ? 'bg-primary' : 'bg-secondary'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait" custom={currentStep}>
                {stepContent[currentStep]}
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2Icon className="w-4 h-4 mr-2" />
                    </motion.div>
                  ) : (
                    <>
                      {currentStep === 3 ? 'Complete Setup' : 'Next'}
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default OnboardingPage;
