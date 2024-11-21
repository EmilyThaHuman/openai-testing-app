import React from 'react';
import { Card } from '@/components/ui/card';
import AudioTesting from '@/components/openai-testing/tabs/AudioTesting';

const AudioPage = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Audio Processing Testing</h1>
        <AudioTesting />
      </Card>
    </div>
  );
};

export default AudioPage; 