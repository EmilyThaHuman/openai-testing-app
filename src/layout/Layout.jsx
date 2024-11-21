import { Outlet } from 'react-router-dom';
import { useOpenAI } from '@/context/OpenAIContext';
import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SettingsDialog } from '@/components/ui/settings-dialog';
import { Button } from '@/components/ui/button';
import { Settings, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Layout() {
  const { apiKey } = useOpenAI();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 h-full z-30">
        <AppSidebar 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={toggleSidebar}
        />
      </div>
      
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "pl-[60px]" : "pl-[200px]"
      )}>
        <div className="container py-4 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "relative z-50 p-2 hover:bg-secondary rounded-lg",
                  "before:absolute before:inset-0 before:-z-10 before:rounded-lg",
                  "hover:before:bg-secondary/50"
                )}
              >
                <Menu className={cn(
                  "h-5 w-5 transition-transform",
                  !isSidebarCollapsed ? "rotate-0" : "rotate-180"
                )} />
              </Button>
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
