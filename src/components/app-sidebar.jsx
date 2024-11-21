import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import {
  ArchiveX,
  Command,
  File,
  Image,
  Inbox,
  LogOut,
  Music,
  Send,
  Settings,
} from 'lucide-react';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppIcon } from '@/components/ui/AppIcon';

const navigationData = [
  {
    title: 'All APIs',
    url: '/openai-test',
    icon: Command,
    description: 'Test all OpenAI APIs',
  },
  {
    title: 'API Dashboard',
    url: '/dashboard',
    icon: Inbox,
    description: 'API usage metrics',
  },
  {
    title: 'Open Canvas',
    url: '/open-canvas',
    icon: File,
    description: 'Interactive coding environment',
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: Send,
    description: 'Chat with AI',
  },
  {
    title: 'Assistants',
    url: '/assistants',
    icon: ArchiveX,
    description: 'Manage AI assistants',
  },
  {
    title: 'Images',
    url: '/images',
    icon: Image,
    description: 'Image generation',
  },
  {
    title: 'Audio',
    url: '/audio',
    icon: Music,
    description: 'Audio processing',
  },
];

export function AppSidebar({ className, isCollapsed = false, setIsCollapsed, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const [activeItem, setActiveItem] = React.useState(
    navigationData.find(item => item.url === location.pathname) ||
      navigationData[0]
  );

  React.useEffect(() => {
    const currentItem = navigationData.find(
      item => item.url === location.pathname
    );
    if (currentItem) {
      setActiveItem(currentItem);
    }
  }, [location.pathname]);

  const handleNavigation = item => {
    setActiveItem(item);
    navigate(item.url);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar
      className={cn(
        'border-r bg-background transition-all duration-300 ease-in-out hover:bg-accent/50',
        isCollapsed ? 'w-[60px]' : 'w-[200px]',
        className
      )}
      {...props}
    >
      <SidebarHeader className="border-b p-2">
        <Link to="/" className="flex items-center gap-2">
          <AppIcon size={isCollapsed ? "sm" : "sm"} animate={false} />
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="font-semibold text-primary">ReedAI</span>
              <span className="text-foreground/80 text-sm ml-1">API</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.map(item => (
                <SidebarMenuItem key={item.url} className="px-2">
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item)}
                    isActive={activeItem?.url === item.url}
                    className={cn(
                      'w-full py-2 hover:bg-accent',
                      isCollapsed ? 'justify-center' : 'justify-start px-2'
                    )}
                    tooltip={
                      isCollapsed
                        ? { content: item.title, side: 'right' }
                        : null
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="ml-2 text-sm">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full h-8 hover:bg-accent",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
            {!isCollapsed && <span className="ml-2 text-sm">Theme</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full h-8 hover:bg-accent",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2 text-sm">Settings</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full h-8 hover:bg-accent text-destructive",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2 text-sm">Sign out</span>}
          </Button>
        </div>

        <NavUser user={user} isCollapsed={isCollapsed} className="mt-2" />
      </SidebarFooter>
    </Sidebar>
  );
}
