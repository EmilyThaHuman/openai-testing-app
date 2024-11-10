import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useOpenAI } from "@/context/OpenAIContext";
import { useToast } from "@/components/ui/use-toast";

export default function CompletionTesting() {
  const { apiKey } = useOpenAI();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    model: 'gpt-3.5-turbo-instruct',
    temperature: 0.7,
    maxTokens: 150,
    topP: 1
  });

  useEffect(() => {
    if (apiKey) {
      UnifiedOpenAIService.initialize(apiKey);
    }
  }, [apiKey]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCompletion = async () => {
    if (!apiKey) {
      const errorMsg = "Please set your OpenAI API key first";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (!prompt.trim()) {
      const errorMsg = "Please enter a prompt";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const completionResponse = await UnifiedOpenAIService.completions.create({
        model: settings.model,
        prompt: prompt.trim(),
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP
      });

      if (!completionResponse?.choices?.length) {
        throw new Error('No completion choices returned from API');
      }

      const completionText = completionResponse.choices[0].text;
      if (typeof completionText !== 'string') {
        throw new Error('Invalid completion response format');
      }

      setResponse(completionText);
    } catch (err) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      console.error('Completion error:', err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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