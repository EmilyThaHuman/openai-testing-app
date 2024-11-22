import React from 'react';
import { useOpenAI } from '@/hooks/use-openai';
import { ApiKeyInput } from '@/components/shared/ApiKeyInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Key, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { apiKey, clearApiKey, isInitialized, error } = useOpenAI();
  const { toast } = useToast();

  const handleClearApiKey = () => {
    clearApiKey();
    toast({
      title: 'API Key Cleared',
      description: 'Your OpenAI API key has been removed'
    });
  };

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">API Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Manage your OpenAI API key and other settings
          </p>
        </div>

        <ApiKeyInput />

        {apiKey && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {isInitialized ? (
                <Key className="w-4 h-4 text-green-500" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span className="text-sm">
                {isInitialized ? 'API Key Configured' : 'Initializing...'}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearApiKey}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear API Key
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}

export default SettingsPage; 