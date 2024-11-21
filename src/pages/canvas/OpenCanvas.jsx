import React from 'react';
import OpenCanvas from '../../components/open-canvas/OpenCanvas';

export const OpenCanvasPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="mb-6 max-w-[2000px] mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">OpenCanvas</h1>
          <p className="text-muted-foreground mt-2">
            Interactive coding environment with AI assistance
          </p>
        </div>
      </div>
      <div className="h-[calc(100vh-8rem)]">
        <OpenCanvas />
      </div>
    </div>
  );
};

export default OpenCanvasPage;
