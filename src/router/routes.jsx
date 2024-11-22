// src/router/routes.jsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '@/layout/Layout';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';

// Auth Pages
import { ChatProvider } from '@/context/ChatContext';
import {
  AccountBillingPage,
  AccountNotificationsPage,
  AccountProfilePage,
  AccountSettingsPage,
  AccountSubscriptionPage,
  AssistantsPage,
  AudioPage,
  AuthCallback,
  ChatPage,
  DocsPage,
  HelpPage,
  HomePage,
  ImagePage,
  LoginPage,
  OnboardingPage,
  OpenAiTestPage,
  OpenCanvasPage,
  RegisterPage,
} from '@/pages';
import ApiDashboard from '@/pages/api/ApiDashboard';

export const router = createBrowserRouter(
  [
    {
      element: (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <AuthProvider>
            <ChatProvider>
              <SidebarProvider>
                <Outlet />
                <Toaster />
              </SidebarProvider>
            </ChatProvider>
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
