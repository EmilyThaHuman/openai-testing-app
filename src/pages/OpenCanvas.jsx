import React from 'react';
import OpenCanvas from '../components/open-canvas/OpenCanvas';

const OpenCanvasPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">OpenCanvas</h1>
          <p className="text-muted-foreground mt-2">
            Interactive coding environment with AI assistance
          </p>
        </div>
        <div className="h-[calc(100vh-12rem)] rounded-lg border shadow-sm">
          <OpenCanvas />
        </div>
      </div>
    </div>
  );
};

export default OpenCanvasPage;
