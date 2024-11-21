import React from 'react';
import { Card } from '@/components/ui/card';
import AudioTesting from '@/components/openai-testing/tabs/AudioTesting';

const AudioPage = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="container py-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Audio Processing Testing</h1>
          <AudioTesting />
        </Card>
      </div>
    </div>
  );
};

export default AudioPage;
