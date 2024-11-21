export const createNotificationsSlice = (set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  notificationsError: null,

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  // Mark as read
  markAsRead: async (notificationId) => {
    const { supabase } = get()
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    const { supabase } = get()
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) throw error

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const { supabase } = get()
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      set(state => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: state.notifications.find(n => n.id === notificationId && !n.read)
          ? state.unreadCount - 1
          : state.unreadCount
      }))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },

  // Subscribe to notifications
  subscribeToNotifications: () => {
    const { supabase } = get()
    const { user } = supabase.auth.getSession()
    if (!user) return () => {}

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${user.id}`
        },
        (payload) => {
          set(state => ({
            notifications: [payload.new, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  },

  // Request notification permissions
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) return false
    
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }
}) 