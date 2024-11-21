import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Add more global database and auth state management here

  return (
    <DatabaseContext.Provider
      value={{
        supabase,
        user,
        setUser,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);

export default DatabaseProvider;