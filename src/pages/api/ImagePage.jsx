import React from 'react';
import { Card } from '@/components/ui/card';
import ImageTesting from '@/components/openai-testing/tabs/ImageTesting';

const ImagePage = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="container py-6">
        <div className="flex-1 min-h-0">
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">
              Image Generation Testing
            </h1>
            <ImageTesting />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
