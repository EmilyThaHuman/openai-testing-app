import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function CompletionTesting() {
  const {
    prompt,
    response,
    loading,
    error,
    settings,
    setPrompt,
    setSettings,
    handleCompletion
  } = useStoreSelector(state => ({
    prompt: state.prompt,
    response: state.response,
    loading: state.loading,
    error: state.error,
    settings: state.completionSettings,
    setPrompt: state.setPrompt,
    setSettings: state.setCompletionSettings,
    handleCompletion: state.handleCompletion
  }));

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="grid gap-4 p-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Completion Settings</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Model</Label>
            <Input
              value={settings.model}
              onChange={(e) => handleSettingChange('model', e.target.value)}
            />
          </div>
          <div>
            <Label>Max Tokens: {settings.maxTokens}</Label>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([value]) => handleSettingChange('maxTokens', value)}
              min={1}
              max={2048}
              step={1}
            />
          </div>
          <div>
            <Label>Temperature: {settings.temperature}</Label>
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              min={0}
              max={2}
              step={0.1}
            />
          </div>
          <div>
            <Label>Top P: {settings.topP}</Label>
            <Slider
              value={[settings.topP]}
              onValueChange={([value]) => handleSettingChange('topP', value)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Prompt</h2>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="min-h-[100px] mb-4"
        />
        <Button 
          onClick={handleCompletion} 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Completion'}
        </Button>
      </Card>

      {error && (
        <Card className="p-4 bg-destructive/10 text-destructive">
          <p className="text-sm">{error}</p>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Result</h2>
        <div className="bg-muted p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
          {response || 'Result will appear here...'}
        </div>
      </Card>
    </div>
  );
} 