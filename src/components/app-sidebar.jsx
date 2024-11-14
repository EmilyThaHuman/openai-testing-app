import * as React from "react"
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react"
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

// Define navigation data structure
const navigationData = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "All APIs",
      url: "/",
      icon: Command,
      isActive: false,
    },
    {
      title: "API Dashboard",
      url: "/api",
      icon: Inbox,
      isActive: false,
    },
    {
      title: "Open Canvas",
      url: "/open-canvas",
      icon: File,
      isActive: false,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: Send,
      isActive: false,
    },
    {
      title: "Assistants",
      url: "/assistants",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Assistant Instances",
      url: "/assistant-instances",
      icon: Inbox,
      isActive: false,
    },
    {
      title: "Images",
      url: "/images",
      icon: File,
      isActive: false,
    },
    {
      title: "Audio",
      url: "/audio",
      icon: Send,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  // Set active item based on current route
  const [activeItem, setActiveItem] = React.useState(
    navigationData.navMain.find(item => item.url === location.pathname) || navigationData.navMain[0]
  );

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* First sidebar - icons only */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">OpenAI Test Site</span>
                    <span className="truncate text-xs">Dashboard</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navigationData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        navigate(item.url);
                      }}
                      isActive={activeItem.url === item.url}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2.5 md:px-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
          </div>
          <NavUser user={navigationData.user} />
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  );
}
