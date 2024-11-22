"use client"

import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  User,
  HelpCircle,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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
    badge: 'Pro'
  },
  {
    title: 'Settings',
    url: '/account/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    url: '/help',
    icon: HelpCircle,
  },
  {
    title: 'Notifications',
    url: '/account/notifications',
    icon: Bell,
  },
  {
    title: 'Subscription',
    url: '/account/subscription',
    icon: BadgeCheck,
  },
]

export function NavUser({ user, isCollapsed, className }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-56" 
          align={isCollapsed ? "center" : "end"}
          side="top"
        >
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            {userNavigation.map((item) => (
              <DropdownMenuItem 
                key={item.url}
                onClick={() => navigate(item.url)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </span>
                {item.badge && (
                  <span className="text-xs font-medium text-primary">
                    {item.badge}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
