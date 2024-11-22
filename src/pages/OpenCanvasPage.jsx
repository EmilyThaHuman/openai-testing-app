import React from 'react';
import OpenCanvas from '@/components/open-canvas/OpenCanvas';

export const OpenCanvasPage = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="flex-1 min-h-0 pt-4 mb-4">
        <OpenCanvas />
      </div>
    </div>
  );
};

export default OpenCanvasPage;
