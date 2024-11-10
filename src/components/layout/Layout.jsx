import { Outlet } from 'react-router-dom';
import { useOpenAI } from '@/context/OpenAIContext';
import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { Navigation } from './Navigation';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
  const { apiKey } = useOpenAI();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        {!apiKey && <ApiKeyInput />}
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
} 