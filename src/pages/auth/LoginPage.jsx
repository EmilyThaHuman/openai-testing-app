// src/pages/auth/LoginPage.jsx
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export function LoginPage() {
  const { signIn, signInWithProvider } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await signIn(
        formData.get('email'),
        formData.get('password')
      )
      navigate('/dashboard')
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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('google')}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('github')}
            >
              Continue with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
