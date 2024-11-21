// App.js

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { router } from './router/routes'
import { ThemeProvider } from './context/ThemeContext'
import { OpenAIProvider } from './context/OpenAIContext'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './components/ui/sidebar'
import { supabase } from './lib/supabase/client'

export function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <RouterProvider router={router} />
      <Toaster />
    </SessionContextProvider>
  )
}
