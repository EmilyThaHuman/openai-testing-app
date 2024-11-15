// src/router/routes.jsx
import { Layout } from '@/layout/Layout';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';

// Landing & Auth Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import { AuthCallback } from '@/pages/auth/AuthCallback'

// App Pages
import { ApiDashboard } from '@/pages/ApiDashboard';
import { OpenAiTestPage } from '@/pages/OpenAiTestPage';
import { AssistantsPage } from '@/pages/AssistantsPage';
import { ChatPage } from '@/pages/ChatPage';
import { ImagePage } from '@/pages/ImagePage';
import { AudioPage } from '@/pages/AudioPage';
import { OpenCanvas } from '@/pages/OpenCanvas';

export const router = createBrowserRouter([
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
        element: <AuthCallback />
      }
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
        element: <OpenCanvas />,
      },
    ],
  },
  
  // Fallback route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
