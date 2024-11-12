// App.js

import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { OpenAIProvider } from "./context/OpenAIContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider } from "./context/ChatContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { Progress } from "@/components/ui/progress";

// Lazy load components with proper error handling
const ApiDashboard = React.lazy(() =>
  import("./pages/ApiDashboard").then((module) => ({
    default: module.default || module.ApiDashboard,
  })),
);

const OpenAITestPage = React.lazy(() =>
  import("./pages/OpenAiTestPage").then((module) => ({
    default: module.default || module.OpenAITestPage,
  })),
);

const AssistantsPage = React.lazy(() =>
  import("./pages/AssistantsPage").then((module) => ({
    default: module.default || module.AssistantsPage,
  })),
);

const ChatPage = React.lazy(() =>
  import("./pages/ChatPage").then((module) => ({
    default: module.default || module.ChatPage,
  })),
);

const ImagePage = React.lazy(() =>
  import("./pages/ImagePage").then((module) => ({
    default: module.default || module.ImagePage,
  })),
);

const AudioPage = React.lazy(() =>
  import("./pages/AudioPage").then((module) => ({
    default: module.default || module.AudioPage,
  })),
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OpenAIProvider>
          <ChatProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-screen">
                    <Progress className="w-[60%]" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route path="api" element={<ApiDashboard />} /> 
                    <Route index element={<OpenAITestPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="assistants" element={<AssistantsPage />} />
                    <Route path="images" element={<ImagePage />} />
                    <Route path="audio" element={<AudioPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ChatProvider>
        </OpenAIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
