import React from 'react';
import { Card } from '@/components/ui/card';
import OpenCanvas from '@/components/open-canvas/OpenCanvas';

const OpenCanvasPage = () => {
  return (
    <div className="mx-auto">
      {/* <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Open Canvas</h1>
      </Card> */}
      <OpenCanvas />
    </div>
  );
};

export default OpenCanvasPage; 