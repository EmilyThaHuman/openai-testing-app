import { forwardRef, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Maximize2, Wand2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const OPENAI_CONFIG = {
  model: "gpt-4",
  systemPrompt:
    "You are a helpful assistant that generates system messages for AI models. Generate clear, detailed system messages that define the AI's role, capabilities, and constraints based on the user's description.",
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
};

export const GenerationDialog = forwardRef(({ value, onChange }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    const apiKey = localStorage.getItem("openai_api_key");

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in the header first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const messages = [
        { role: "system", content: OPENAI_CONFIG.systemPrompt },
        {
          role: "user",
          content: `Generate a system message for an AI assistant with these requirements: ${description}`,
        },
      ];

      const response = await fetch(OPENAI_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.model,
          messages,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error?.message || "Failed to generate instructions"
        );

      onChange(data.choices[0].message.content);
      setDialogOpen(false);
      setDescription("");

      toast({
        title: "Instructions generated",
        description:
          "New system instructions have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate system instructions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [description, onChange, toast]);

  const handleDialogChange = useCallback((open) => {
    setDialogOpen(open);
    if (!open) setDescription("");
  }, []);

  const handleSheetChange = useCallback((open) => {
    setSheetOpen(open);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="You are a helpful assistant..."
          className="min-h-[100px] pr-16 resize-none"
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSheetOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDialogOpen(true)}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Edit system instructions</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What would you like the model to do?"
              className="h-[200px] resize-none"
              disabled={isGenerating}
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">Free beta</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="relative"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={handleSheetChange}>
        <SheetContent side="right" className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>Edit system instructions</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-[calc(100vh-200px)] resize-none"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSheetOpen(false)}>Save</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});

// Add display name for better debugging
GenerationDialog.displayName = "GenerationDialog"; 