import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { motion, AnimatePresence } from "framer-motion";
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Download } from "lucide-react";

export default function ImageTesting() {
  const {
    prompt,
    images,
    loading,
    error,
    settings,
    setPrompt,
    setSettings,
    generateImage
  } = useStoreSelector(state => ({
    prompt: state.imagePrompt,
    images: state.generatedImages,
    loading: state.isGeneratingImage,
    error: state.imageError,
    settings: state.imageSettings,
    setPrompt: state.setImagePrompt,
    setSettings: state.setImageSettings,
    generateImage: state.generateImage
  }));

  return (
    <motion.div 
      className="container max-w-4xl mx-auto space-y-6 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select 
              value={settings.model} 
              onValueChange={(value) => setSettings({ ...settings, model: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {settings.models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label>Prompt</Label>
          <Textarea
            placeholder="Enter your image generation prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button 
          onClick={generateImage} 
          disabled={loading || !prompt.trim()}
          className="mt-4 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : 'Generate Image'}
        </Button>
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-destructive/10 text-destructive">
              {error}
            </Card>
          </motion.div>
        )}

        {images.length > 0 && (
          <motion.div 
            className="grid gap-6 sm:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-auto aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="p-3 border-t bg-muted/50">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(image.url)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 