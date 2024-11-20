// src/pages/auth/LoginPage.jsx
import { useEffect } from 'react'
import { AppIcon } from '@/components/ui/AppIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { GitHub, Google } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { signIn, signInWithProvider, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password)
      navigate('/open-canvas')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please try again'
      })
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      await signInWithProvider(provider)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please try again'
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full border-2 shadow-lg">
            <CardHeader>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center mb-8"
              >
                <AppIcon size="xl" className="animate-float" />
                <h1 className="mt-4 text-2xl font-bold text-center">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to ReedAI API Playground
                </p>
              </motion.div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('github')}
                    className="w-full transition-all hover:scale-105"
                  >
                    <GitHub className="mr-2 h-4 w-4" />
                    Github
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full transition-all hover:scale-105"
                  >
                    <Google className="mr-2 h-4 w-4" />
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
                  onSubmit={onSubmit} 
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
                      className="w-full transition-all focus:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      className="w-full transition-all focus:scale-[1.02]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full transition-all hover:scale-105"
                  >
                    Sign In
                  </Button>
                </motion.form>

                <div className="text-center text-sm">
                  Don&apos;t have an account?
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal hover:text-primary"
                    onClick={() => navigate('/auth/register')}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
