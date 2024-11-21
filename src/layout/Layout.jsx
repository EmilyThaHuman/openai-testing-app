import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/ui/settings-dialog';
import { Toaster } from '@/components/ui/toaster';
import { useOpenAI } from '@/context/OpenAIContext';
import { AppSidebar } from '@/layout/app-sidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Menu, Settings } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function Layout() {
  const { apiKey } = useOpenAI();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="fixed top-0 left-0 h-full z-30">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      <motion.main
        className={cn(
          'flex-1 flex flex-col min-h-screen w-full',
          'transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'pl-[60px]' : 'pl-[240px]'
        )}
        layout
      >
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur border-b">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <Menu
                    className={cn(
                      'h-5 w-5 transition-transform',
                      !isSidebarCollapsed ? 'rotate-0' : 'rotate-180'
                    )}
                  />
                </Button>
                <Breadcrumbs />
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!apiKey && (
          <div className="container py-4">
            <ApiKeyInput className="mb-4" />
          </div>
        )}

        <div className="flex-1 flex flex-col w-full min-h-0 pl-4 pr-4 overflow-auto">
          <Outlet />
        </div>
      </motion.main>

      <Toaster />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

export default Layout;
