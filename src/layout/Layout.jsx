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
import { cn } from '@/lib/utils';

export function Layout() {
  const { apiKey } = useOpenAI();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={cn(
      "min-h-screen bg-background flex",
      "transition-all duration-300 ease-in-out"
    )}>
      <AppSidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <main className={cn(
        "flex-1 flex flex-col",
        isSidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        <div className="container py-4 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger 
                isOpen={isSidebarOpen}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              />
              <Breadcrumbs />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {!apiKey && <ApiKeyInput className="mb-4" />}
          
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </main>

      <Toaster />
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </div>
  );
}

export default Layout;
