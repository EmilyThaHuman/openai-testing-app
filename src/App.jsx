// App.js

import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { OpenAIProvider } from './context/OpenAIContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { DatabaseProvider } from './context/DatabaseProvider';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { Progress } from '@/components/ui/progress';
import { Toaster } from './components/ui/toaster';
import { router } from './router/routes.jsx';


// // Lazy load components with proper error handling
// const LandingPage = React.lazy(() =>
//   import('./pages/LandingPage').then(module => ({
//     default: module.default || module.LandingPage,
//   }))
// );

// const SignInPage = React.lazy(() =>
//   import('./pages/AuthPage').then(module => ({
//     default: module.default || module.AuthPage,
//   }))
// );  

// const SignUpPage = React.lazy(() =>
//   import('./pages/AuthPage').then(module => ({
//     default: module.default || module.AuthPage,
//   }))
// );

// const ApiDashboard = React.lazy(() =>
//   import('./pages/ApiDashboard').then(module => ({
//     default: module.default || module.ApiDashboard,
//   }))
// );

// const OpenCanvasPage = React.lazy(() =>
//   import('./pages/OpenCanvas').then(module => ({
//     default: module.default || module.OpenCanvasPage,
//   }))
// );

// const AssistantInstancesTestPage = React.lazy(() =>
//   import('./pages/AssistantInstancesTestPage').then(module => ({
//     default: module.default || module.AssistantInstancesTestPage,
//   }))
// );

// const OpenAITestPage = React.lazy(() =>
//   import('./pages/OpenAiTestPage').then(module => ({
//     default: module.default || module.OpenAITestPage,
//   }))
// );

// const AssistantsPage = React.lazy(() =>
//   import('./pages/AssistantsPage').then(module => ({
//     default: module.default || module.AssistantsPage,
//   }))
// );

// const ChatPage = React.lazy(() =>
//   import('./pages/ChatPage').then(module => ({
//     default: module.default || module.ChatPage,
//   }))
// );

// const ImagePage = React.lazy(() =>
//   import('./pages/ImagePage').then(module => ({
//     default: module.default || module.ImagePage,
//   }))
// );

// const AudioPage = React.lazy(() =>
//   import('./pages/AudioPage').then(module => ({
//     default: module.default || module.AudioPage,
//   }))
// );

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DatabaseProvider>
          <ThemeProvider>
            <OpenAIProvider>
              <ChatProvider>
                <SidebarProvider>
                  <RouterProvider router={router} />
                  <Toaster />
                  {/* <BrowserRouter>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-screen">
                        <Progress className="w-[60%]" />
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />

                        <Route path="api" element={<ApiDashboard />} />
                        <Route
                          path="open-canvas"
                          element={<OpenCanvasPage />}
                        />
                        <Route
                          path="assistant-instances"
                          element={<AssistantInstancesTestPage />}
                        />
                        <Route index element={<OpenAITestPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="assistants" element={<AssistantsPage />} />
                        <Route path="images" element={<ImagePage />} />
                        <Route path="audio" element={<AudioPage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter> */}
                </SidebarProvider>
              </ChatProvider>
            </OpenAIProvider>
          </ThemeProvider>
        </DatabaseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
