import React, { useState } from 'react';
import { useOpenAI } from '@/context/OpenAIContext';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ImageTesting() {
  const { apiKey } = useOpenAI();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('vivid');
  const [model, setModel] = useState('dall-e-3');

  const sizes = ['1024x1024', '1024x1792', '1792x1024'];
  const qualities = ['standard', 'hd'];
  const styles = ['vivid', 'natural'];
  const models = ['dall-e-2', 'dall-e-3'];

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await UnifiedOpenAIService.images.generate({
        prompt,
        n: 1,
        size,
        quality,
        style,
        model
      });
      setImages(response.data);
    } catch (error) {
      console.error('Image generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Size</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Quality</Label>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {qualities.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Enter your image generation prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={generateImage} 
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mt-4 text-red-500">
          {error}
        </Card>
      )}

      {images.length > 0 && (
        <div className="grid gap-4 mt-4">
          {images.map((image, index) => (
            <Card key={index} className="p-4">
              <img
                src={image.url}
                alt={`Generated image ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 