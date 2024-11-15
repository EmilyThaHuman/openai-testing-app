// src/router/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { Layout } from '@/components/layout/Layout';

// --- PAGES ---
//     | Landing
import LandingPage from '@/pages/LandingPage';
//     | Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';
//     | DEV
import ApiDashboard from '@/pages/ApiDashboard';
import OpenAiTestPage from '@/pages/OpenAiTestPage';
//     | AI
import AssistantsPage from '@/pages/AssistantsPage';
import ChatPage from '@/pages/ChatPage';
//     | OpenCanvas
import OpenCanvas from '@/pages/OpenCanvas';
// --- COMPONENTS ---
import PublicOnlyRoute from '@/components/routes/PublicOnlyRoute';

export const router = createBrowserRouter([
  // Landing page
  {
    path: '/',
    element: <LandingPage />,
  },
  // Auth routes
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />,
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
        path: '/api',
        element: <ApiDashboard />,
      },
      {
        path: '/open-canvas',
        element: <OpenCanvas />,
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
        path: '/openai-test',
        element: <OpenAiTestPage />,
      },
    ],
  },
  // 404 route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
