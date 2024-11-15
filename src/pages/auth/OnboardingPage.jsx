import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Logo } from '@/layout/Logo'
import { fadeInAnimation } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const stepSchema = z.discriminatedUnion('step', [
  // Step 1: Workspace
  z.object({
    step: z.literal(1),
    workspaceName: z.string().min(2, 'Workspace name is required'),
    workspaceContext: z.string(),
    workspaceAvatar: z.string()
  }),
  // Step 2: AI Tools
  z.object({
    step: z.literal(2),
    modelPresets: z.array(z.any()).optional(),
    toolDefinitions: z.string(),
    actionPlugins: z.array(z.any()).optional()
  }),
  // Step 3: Account
  z.object({
    step: z.literal(3),
    isPro: z.boolean(),
  })
])

const steps = [
  { 
    title: 'Set up your workspace', 
    description: 'Configure your API testing environment' 
  },
  { 
    title: 'Configure API tools', 
    description: 'Set up your OpenAI API integration' 
  },
  { 
    title: 'Choose your plan', 
    description: 'Select your API testing capabilities' 
  }
]

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { toast } = useToast()
  const supabase = useSupabaseClient()

  const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      step: currentStep,
      workspaceName: '',
      workspaceContext: '',
      workspaceAvatar: 'default',
      modelPresets: [],
      toolDefinitions: '',
      actionPlugins: [],
      isPro: false
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

  const isPro = watch('isPro')

  const onSubmit = async (data) => {
    try {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1)
        return
      }

      // Handle final submission
      const { error } = await supabase
        .from('workspaces')
        .insert([{
          name: data.workspaceName,
          context: data.workspaceContext,
          avatar: data.workspaceAvatar,
          settings: {
            isPro: data.isPro,
            modelPresets: data.modelPresets,
            toolDefinitions: data.toolDefinitions
          }
        }])

      if (error) throw error

      toast({
        title: 'Setup complete!',
        description: 'Your workspace is ready to use.'
      })
      
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: error.message
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Logo />
      
      <motion.div
        className="w-full max-w-2xl"
        {...fadeInAnimation}
      >
        <Card>
          <CardHeader>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-muted-foreground mt-2">
                Step {currentStep} of 3 - {steps[currentStep - 1].description}
              </p>
            </div>

            <div className="flex justify-between mb-8">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 < currentStep ? 'bg-primary text-primary-foreground' :
                    index + 1 === currentStep ? 'bg-primary text-primary-foreground' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-primary' : 'bg-secondary'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName">Workspace Name</Label>
                    <Controller
                      name="workspaceName"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id="workspaceName" />
                      )}
                    />
                    {errors.workspaceName && (
                      <p className="text-sm text-destructive">{errors.workspaceName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workspaceContext">Workspace Context</Label>
                    <Controller
                      name="workspaceContext"
                      control={control}
                      render={({ field }) => (
                        <Textarea {...field} id="workspaceContext" />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workspaceAvatar">Workspace Avatar</Label>
                    <Controller
                      name="workspaceAvatar"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an avatar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="rocket">Rocket</SelectItem>
                            <SelectItem value="star">Star</SelectItem>
                            <SelectItem value="lightning">Lightning</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Model Presets</Label>
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <p className="text-muted-foreground">
                        Drag & drop model preset files here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        JSON files up to 10MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toolDefinitions">Tool Definitions</Label>
                    <Controller
                      name="toolDefinitions"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="toolDefinitions"
                          placeholder="Enter your tool definitions in JSON format"
                        />
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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

                  {isPro && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-secondary/50 rounded-lg p-4"
                    >
                      <h4 className="text-sm font-medium mb-2">Pro features include:</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center">
                          <motion.span className="mr-2">✓</motion.span>
                          Unlimited API endpoint testing
                        </li>
                        <li className="flex items-center">
                          <motion.span className="mr-2">✓</motion.span>
                          Advanced response visualization
                        </li>
                        <li className="flex items-center">
                          <motion.span className="mr-2">✓</motion.span>
                          Custom testing environments
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 
                   currentStep === 3 ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
