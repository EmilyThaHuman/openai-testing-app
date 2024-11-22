// App.js

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { supabase } from './lib/supabase/client';
import { router } from './router/routes';

export function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <RouterProvider router={router} />
      <Toaster />
    </SessionContextProvider>
  );
}
