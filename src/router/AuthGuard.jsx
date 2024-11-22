// src/router/AuthGuard.jsx
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, user, setAuthLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error('Auth check timed out');
        setAuthLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [loading, setAuthLoading]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Verifying authentication...</p>
            <p className="text-sm text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  if (
    user?.needsOnboarding &&
    !location.pathname.includes('onboarding') &&
    !location.pathname.includes('callback')
  ) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background w-full">{children}</div>
  );
};
