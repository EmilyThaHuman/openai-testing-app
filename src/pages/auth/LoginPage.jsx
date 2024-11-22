// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { AppIcon } from '@/components/ui/AppIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const { signInWithOAuth, signInWithEmail } = useAuth();
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true)
      await signInWithOAuth(provider);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `${provider} login failed`,
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await signInWithEmail(formData.email, formData.password)
      navigate('/open-canvas')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-background/90 to-background">
      <div className="w-full max-w-md mx-auto p-4 flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
          >
            <AppIcon size="xl" className="animate-float" />
          </motion.div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to ReedAI API Playground
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              {/* Social Login Buttons */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full h-11 hover:scale-[1.02] transition-transform"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                >
                  <FaGithub className="mr-2 h-5 w-5" />
                  Continue with GitHub
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 hover:scale-[1.02] transition-transform"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <FaGoogle className="mr-2 h-5 w-5" />
                  Continue with Google
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

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 hover:scale-[1.02] transition-transform"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pb-6">
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal hover:text-primary"
                    onClick={() => navigate('/auth/register')}
                    disabled={isLoading}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
