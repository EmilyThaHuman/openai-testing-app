import React from 'react';
import { Card } from '@/components/ui/card';
import ImageTesting from '@/components/openai-testing/tabs/ImageTesting';

const ImagePage = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Image Generation Testing</h1>
        <ImageTesting />
      </Card>
    </div>
  );
};

export default ImagePage; 