import { Outlet } from 'react-router-dom';
import { useOpenAI } from '@/context/OpenAIContext';
import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Layout() {
  const { apiKey } = useOpenAI();

  return (
    <div className="min-h-screen bg-background flex min-w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <div className="container py-6 flex-grow">
          <SidebarTrigger />
          {!apiKey && <ApiKeyInput />}
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
