import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Github, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { AppIcon } from '@/components/ui/AppIcon'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

export function RegisterPage() {
  const { signUp, signInWithProvider } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await signUp(
        formData.get('email'),
        formData.get('password')
      )
      toast({
        title: 'Registration successful!',
        description: 'Please check your email to verify your account.'
      })
      navigate('/onboarding')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Please try again'
      })
    }
  }

  const handleOAuthSignUp = async (provider) => {
    try {
      await signInWithProvider(provider)
      navigate('/onboarding')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Please try again'
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center mb-8"
          >
            <AppIcon size="xl" className="animate-float" />
            <h1 className="mt-4 text-2xl font-bold text-center">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get started with ReedAI API Playground
            </p>
          </motion.div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleOAuthSignUp('github')}
                className="transition-all hover:scale-105"
              >
                <Github className="mr-2 h-4 w-4" />
                Github
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleOAuthSignUp('google')}
                className="transition-all hover:scale-105"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full transition-all hover:scale-105"
              >
                Create account
              </Button>
            </motion.form>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal hover:text-primary"
                onClick={() => navigate('/auth/login')}
              >
                Sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 