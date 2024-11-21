// src/router/routes.jsx
import { Layout } from '@/layout/Layout';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OpenAIProvider } from '@/context/OpenAIContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

// Auth Pages
import {
  HomePage,
  LoginPage,
  RegisterPage,
  OnboardingPage,
  AuthCallback,
} from '@/pages/auth';

// Dashboard Pages
import {
  ApiDashboard,
  ProfilePage,
  SettingsPage,
} from '@/pages/dashboard';

// API Pages
import {
  OpenAiTestPage,
  AssistantsPage,
  ChatPage,
  ImagePage,
  AudioPage,
} from '@/pages/api';

// Canvas Pages
import { OpenCanvasPage } from '@/pages/canvas';

// Docs Pages
import { DocsPage } from '@/pages/docs';

// Billing Pages
import { BillingPage } from '@/pages/billing';

export const router = createBrowserRouter(
  [
    {
      element: (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <AuthProvider>
            <OpenAIProvider>
              <SidebarProvider>
                <Outlet />
                <Toaster />
              </SidebarProvider>
            </OpenAIProvider>
          </AuthProvider>
        </ThemeProvider>
      ),
      children: [
        // Public routes
        {
          path: '/',
          element: <HomePage />,
        },
        {
          path: '/auth',
          children: [
            {
              path: 'login',
              element: <LoginPage />,
            },
            {
              path: 'register',
              element: <RegisterPage />,
            },
            {
              path: 'onboarding',
              element: (
                <AuthGuard>
                  <OnboardingPage />
                </AuthGuard>
              ),
            },
            {
              path: 'callback',
              element: <AuthCallback />,
            },
          ],
        },

        // Protected routes
        {
          element: (
            <AuthGuard>
              <Layout />
            </AuthGuard>
          ),
          children: [
            {
              path: '/dashboard',
              element: <ApiDashboard />,
            },
            {
              path: '/chat',
              element: <ChatPage />,
            },
            {
              path: '/assistants',
              element: <AssistantsPage />,
            },
            {
              path: '/images',
              element: <ImagePage />,
            },
            {
              path: '/audio',
              element: <AudioPage />,
            },
            {
              path: '/openai-test',
              element: <OpenAiTestPage />,
            },
            {
              path: '/open-canvas',
              element: <OpenCanvasPage />,
            },
            {
              path: '/settings',
              element: <SettingsPage />,
            },
            {
              path: '/profile',
              element: <ProfilePage />,
            },
            {
              path: '/docs',
              element: <DocsPage />,
            },
            {
              path: '/billing',
              element: <BillingPage />,
            },
          ],
        },

        // Fallback route
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_routeLoader: true,
    },
  }
);
