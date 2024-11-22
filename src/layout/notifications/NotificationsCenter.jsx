import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const notificationIcons = {
  success: Check,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle
}

export function NotificationsCenter({ className }) {
  const { 
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useStore()

  useEffect(() => {
    // Only request notification permission
    const requestPermission = async () => {
      if ('Notification' in window) {
        await Notification.requestPermission()
      }
    }
    requestPermission()
  }, [])

  return (
    <div className={cn("w-full max-w-sm rounded-lg border bg-background shadow-lg", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Info
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      "relative p-4 rounded-lg border",
                      !notification.read && "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className={cn(
                        "h-5 w-5",
                        notification.type === 'success' && "text-green-500",
                        notification.type === 'error' && "text-red-500",
                        notification.type === 'warning' && "text-yellow-500",
                        notification.type === 'info' && "text-blue-500"
                      )} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p>No notifications</p>
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
} 