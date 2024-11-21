import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { supabase } from '@/lib/supabase/client';

const DatabaseContext = React.createContext(null);

export const DatabaseProvider = ({ children }) => {
  const databaseState = useStoreSelector((state) => ({
    user: state.user,
    setUser: state.setUser,
    profile: state.profile,
    updateProfile: state.updateProfile,
    loading: state.loading,
    error: state.error
  }));

  return (
    <DatabaseContext.Provider
      value={{
        ...databaseState,
        supabase
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = React.useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export default DatabaseProvider;