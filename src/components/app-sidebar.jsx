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
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { useStoreShallow } from '@/store/useStore';
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

export function AppSidebar({ className, ...props }) {
  const store = useStoreShallow();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [activeItem, setActiveItem] = React.useState(
    navigationData.find(item => item.url === location.pathname) ||
      navigationData[0]
  );

  // Update active item when route changes
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
        'border-r bg-background transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[80px]' : 'w-[240px]',
        className
      )}
      {...props}
    >
      <SidebarHeader className="border-b p-4">
        <Link to="/" className="flex items-center space-x-2">
          <AppIcon size={isCollapsed ? "md" : "sm"} animate={false} />
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="font-semibold text-primary">ReedAI</span>
              <span className="text-foreground/80 text-sm ml-1">API</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item)}
                    isActive={activeItem?.url === item.url}
                    className={cn(
                      'w-full',
                      isCollapsed ? 'justify-center' : 'justify-start'
                    )}
                    tooltip={
                      isCollapsed
                        ? { content: item.title, side: 'right' }
                        : null
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
            {!isCollapsed && <span className="ml-2">Theme</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">Sign out</span>}
          </Button>
        </div>

        <NavUser user={user} isCollapsed={isCollapsed} className="mt-4" />
      </SidebarFooter>
    </Sidebar>
  );
}
