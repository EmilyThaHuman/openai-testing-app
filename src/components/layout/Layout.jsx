import React from 'react';
import { useOpenAI } from '@/hooks/use-openai';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

export function Layout() {
  const { apiKey, isInitialized, error } = useOpenAI();

  if (!apiKey) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout; 