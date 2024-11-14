import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const AuthPage = () =>  {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (authMode === 'signup') {
        // Handle signup
        toast({
          title: 'Account created',
          description: "Welcome! Let's set up your profile.",
        });
        navigate('/onboarding');
      } else {
        // Handle signin
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthMode(prev => (prev === 'signin' ? 'signup' : 'signin'));
    form.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <Card className="relative overflow-hidden">
          <CardHeader>
            <motion.div
              initial={false}
              animate={{ x: authMode === 'signin' ? 0 : -400 }}
              className="absolute top-0 left-0 w-full p-6"
            >
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Welcome back to AI Playground</CardDescription>
            </motion.div>
            <motion.div
              initial={false}
              animate={{ x: authMode === 'signup' ? 0 : 400 }}
              className="absolute top-0 left-0 w-full p-6"
            >
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Join AI Playground</CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-12">
              <AnimatePresence mode="wait">
                {authMode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      className="w-full"
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full"
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : authMode === 'signin' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>

              <motion.div
                animate={{ opacity: 1 }}
                className="text-sm text-center space-x-1"
              >
                <span className="text-muted-foreground">
                  {authMode === 'signin'
                    ? 'New to AI Playground?'
                    : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline"
                >
                  {authMode === 'signin' ? 'Create account' : 'Sign in'}
                </button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 

export default AuthPage;
