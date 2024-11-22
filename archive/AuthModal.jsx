import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { authMiddleware } from '@/lib/auth';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAuth = async data => {
    setLoading(true);
    const { email, password } = data;
    try {
      if (mode === 'signup') {
        await authMiddleware.signUp(email, password);
        navigate('/onboarding/profile');
      } else {
        await authMiddleware.signIn(email, password);
        navigate('/dashboard');
      }
      onClose();
    } catch (error) {
      console.error(error);
      // Optionally, display error messages to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-6">
            {/* Email Field */}
            <FormItem>
              <FormControl>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...form.register('email', { required: 'Email is required' })}
                />
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormControl>
            </FormItem>

            {/* Password Field */}
            <FormItem>
              <FormControl>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...form.register('password', {
                    required: 'Password is required',
                  })}
                />
                <FormMessage>
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormControl>
            </FormItem>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? 'Processing...'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign Up'}
            </Button>
          </form>
        </Form>

        {/* Toggle Auth Mode */}
        <div className="mt-4 text-center text-sm">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="underline font-medium text-blue-600 hover:text-blue-800"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
