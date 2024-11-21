// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { AppIcon } from '@/components/ui/AppIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { Separator } from '@/components/ui/separator'

export function LoginPage() {
  const { signIn, signInWithEmail } = useAuth()
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
      const { error } = await signIn(provider, {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      })
      if (error) throw error
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <AppIcon size="lg" className="mb-2" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-center">
            Sign in to continue to ReedAI API Playground
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Social Login Buttons */}
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                <FaGithub className="mr-2" />
                Continue with GitHub
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <FaGoogle className="mr-2" />
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
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                  disabled={isLoading}
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
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-center text-muted-foreground w-full">
              Don&apos;t have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal"
                onClick={() => navigate('/auth/register')}
                disabled={isLoading}
              >
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
