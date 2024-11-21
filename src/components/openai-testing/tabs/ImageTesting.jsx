import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';

const ImageTesting = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [model, setModel] = useState('dall-e-3');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('natural');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateImage = async () => {
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await UnifiedOpenAIService.images.generate({
        model,
        prompt,
        n: 1,
        size,
        quality,
        style,
      });

      setGeneratedImage(response.data[0].url);
    } catch (err) {
      setError(err.message);
      console.error('Image generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = ['1024x1024', '1024x1792', '1792x1024'];
  const models = ['dall-e-2', 'dall-e-3'];
  const qualities = ['standard', 'hd'];
  const styles = ['natural', 'vivid'];

  useEffect(() => {
    UnifiedOpenAIService.initialize(import.meta.env.VITE_OPENAI_API_KEY);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Input
          placeholder="Enter your image prompt..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Select value={model} onValueChange={setModel} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(m => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={size} onValueChange={setSize} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={quality}
            onValueChange={setQuality}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {qualities.map(q => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={style} onValueChange={setStyle} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerateImage}
          disabled={!prompt || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">Error: {error}</div>}

      {generatedImage && (
        <div className="mt-4">
          <img
            src={generatedImage}
            alt="Generated"
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

// Wrap the component with ErrorBoundary
const ImageTestingWithErrorBoundary = () => (
  <ErrorBoundary>
    <ImageTesting />
  </ErrorBoundary>
);

export default ImageTestingWithErrorBoundary;
