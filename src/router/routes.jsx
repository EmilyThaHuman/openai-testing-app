// src/router/routes.jsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { OpenAIProvider } from '@/context/OpenAIContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '@/layout/Layout';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';

// Auth Pages
import {
  AuthCallback,
  HomePage,
  LoginPage,
  OnboardingPage,
  RegisterPage,
} from '@/pages/auth';

// Dashboard Pages
import { ApiDashboard } from '@/pages/dashboard';

// API Pages
import {
  AssistantsPage,
  AudioPage,
  ChatPage,
  ImagePage,
  OpenAiTestPage,
} from '@/pages/api';

// Canvas Pages
import { OpenCanvasPage } from '@/pages/canvas';

// Docs Pages
import { DocsPage } from '@/pages/docs';

// Account Pages
import {
  AccountBillingPage,
  AccountNotificationsPage,
  AccountProfilePage,
  AccountSettingsPage,
  AccountSubscriptionPage,
} from '@/pages/account';

// Help Pages
import { HelpPage } from '@/pages/help';

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
            // Dashboard
            {
              path: '/dashboard',
              element: <ApiDashboard />,
            },
            // API Features
            {
              path: '/openai-test',
              element: <OpenAiTestPage />,
            },
            {
              path: '/assistants',
              element: <AssistantsPage />,
            },
            {
              path: '/chat',
              element: <ChatPage />,
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
              path: '/open-canvas',
              element: <OpenCanvasPage />,
            },
            // Account
            {
              path: '/account',
              children: [
                {
                  path: 'profile',
                  element: <AccountProfilePage />,
                },
                {
                  path: 'billing',
                  element: <AccountBillingPage />,
                },
                {
                  path: 'settings',
                  element: <AccountSettingsPage />,
                },
                {
                  path: 'notifications',
                  element: <AccountNotificationsPage />,
                },
                {
                  path: 'subscription',
                  element: <AccountSubscriptionPage />,
                },
              ],
            },
            // Help & Docs
            {
              path: '/help',
              element: <HelpPage />,
            },
            {
              path: '/docs',
              element: <DocsPage />,
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
