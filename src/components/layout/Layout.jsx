import { Outlet } from 'react-router-dom';
import { useOpenAI } from '@/context/OpenAIContext';
import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SettingsDialog } from '@/components/ui/settings-dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { apiKey } = useOpenAI();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex min-w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <div className="container py-4 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <SidebarTrigger />
            <div className="flex items-center justify-start flex-grow">
              <Breadcrumbs />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          {!apiKey && <ApiKeyInput />}
          <Outlet />
        </div>
      </main>
      <Toaster />
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default Layout;
