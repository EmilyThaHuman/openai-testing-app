import { NavUser } from '@/layout/nav-user';
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
  Bell,
  CreditCard,
  User,
  HelpCircle,
  LayoutDashboard,
  Code,
  Bot,
  Sparkles,
  Mic,
  Gauge,
  FileCode,
  Braces,
  Keyboard,
} from 'lucide-react';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppIcon } from '@/components/ui/AppIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { NotificationsCenter } from '@/layout/notifications/NotificationsCenter';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const navigationData = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and metrics',
  },
  {
    title: 'API Testing',
    url: '/openai-test',
    icon: Code,
    description: 'Test OpenAI APIs',
  },
  {
    title: 'Assistants',
    url: '/assistants',
    icon: Bot,
    description: 'Manage AI assistants',
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: Send,
    description: 'Chat with AI',
  },
  {
    title: 'Open Canvas',
    url: '/open-canvas',
    icon: FileCode,
    description: 'Interactive coding environment',
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
    icon: Mic,
    description: 'Audio processing',
  },
];

const userNavigation = [
  {
    title: 'Profile',
    url: '/account/profile',
    icon: User,
  },
  {
    title: 'Billing',
    url: '/account/billing',
    icon: CreditCard,
    badge: 'Pro',
  },
  {
    title: 'Settings',
    url: '/account/settings',
    icon: Settings,
  },
  {
    title: 'Documentation',
    url: '/docs',
    icon: HelpCircle,
  },
];

// Add sidebar animation variants
const sidebarVariants = {
  expanded: {
    width: '240px',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
      when: 'beforeChildren',
    },
  },
  collapsed: {
    width: '60px',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
      when: 'afterChildren',
    },
  },
};

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export function AppSidebar({
  className,
  isCollapsed = false,
  setIsCollapsed,
  ...props
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { unreadCount } = useStore();

  const isActive = React.useCallback(
    url => {
      return (
        location.pathname === url || location.pathname.startsWith(`${url}/`)
      );
    },
    [location]
  );

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'fixed top-0 left-0 z-30 h-screen',
        'border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'transition-all duration-300 ease-in-out hover:bg-accent/50',
        className
      )}
      {...props}
    >
      <SidebarHeader className="border-b p-2">
        <Link to="/" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AppIcon size={isCollapsed ? 'sm' : 'sm'} animate={false} />
          </motion.div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center"
              >
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                  ReedAI
                </span>
                <span className="text-foreground/80 text-sm ml-1">API</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.map(item => (
                <motion.div
                  key={item.url}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <SidebarMenuItem className="px-2">
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive(item.url)}
                      className={cn(
                        'w-full py-2 hover:bg-accent/80 transition-all duration-200',
                        'rounded-md relative overflow-hidden',
                        isCollapsed ? 'justify-center' : 'justify-start px-2'
                      )}
                      tooltip={
                        isCollapsed
                          ? { content: item.title, side: 'right' }
                          : null
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            variants={itemVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="ml-2 text-sm"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="space-y-2">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full h-8 hover:bg-accent transition-colors relative',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        variants={itemVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="ml-2 text-sm"
                      >
                        Notifications
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                className="w-80 p-0"
                align={isCollapsed ? 'start' : 'center'}
              >
                <NotificationsCenter />
              </PopoverContent>
            </Popover>
          </motion.div>

          {userNavigation.map(item => (
            <motion.div key={item.url} whileHover={{ scale: 1.02 }}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full h-8 hover:bg-accent transition-colors relative',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                onClick={() => navigate(item.url)}
              >
                <item.icon className="h-4 w-4" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="ml-2 text-sm flex-1 text-left"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !isCollapsed && (
                  <span className="text-xs font-medium text-primary">
                    {item.badge}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="opacity-90 hover:opacity-100"
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full h-8 hover:bg-destructive/10 text-destructive transition-colors',
                isCollapsed ? 'justify-center' : 'justify-start'
              )}
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    variants={itemVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="ml-2 text-sm"
                  >
                    Sign out
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} className="mt-2">
          <NavUser user={user} isCollapsed={isCollapsed} />
        </motion.div>
      </SidebarFooter>
    </motion.div>
  );
}
