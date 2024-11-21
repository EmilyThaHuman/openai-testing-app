import React, { useState, useRef, useEffect } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Wand2, Loader2, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function SystemInstructions({ value, onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (value && value.trim() !== '') {
      setIsExpanded(true);
    }
  }, [value]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error('Failed to generate instructions');

      const data = await response.json();
      onChange(data.instructions);
      setDialogOpen(false);
      setIsExpanded(true);
      toast({
        title: 'Instructions generated',
        description:
          'New system instructions have been generated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative rounded-xl bg-black hover:bg-gray-900 transition-colors">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">
            System instructions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
            className="h-7 px-3 text-xs font-medium text-white hover:text-gray-300"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            Generate
          </Button>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="resize-none text-sm bg-black border-gray-700 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-white focus:border-white hover:border-white transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base text-white">
              Generate System Instructions
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what kind of AI assistant you want to create..."
              className="h-[150px] text-sm bg-black/50 border-gray-700 text-white focus:ring-1 focus:ring-white focus:border-white"
              disabled={isGenerating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={isGenerating}
              className="text-sm text-white hover:text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SystemInstructions;
