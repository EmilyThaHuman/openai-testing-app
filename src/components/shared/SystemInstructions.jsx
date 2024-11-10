import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Wand2, Loader2 } from "lucide-react";

const SystemInstructions = ({ value, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
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
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that generates system messages for AI models. Generate clear, detailed system messages that define the AI's role, capabilities, and constraints based on the user's description.",
              },
              {
                role: "user",
                content: `Generate a system message for an AI assistant with these requirements: ${description}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to generate instructions"
        );
      }

      const generatedInstructions = data.choices[0].message.content;
      onChange(generatedInstructions);
      setDialogOpen(false);
      toast({
        title: "Instructions generated",
        description:
          "New system instructions have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate system instructions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">System Instructions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="transition-colors rounded-full px-4 bg-green-50 hover:bg-green-100 border-green-200"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {isGenerating ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="You are a helpful assistant..."
          className="min-h-[200px] resize-y"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="transition-all duration-300 ease-in-out">
          <DialogHeader>
            <DialogTitle>Generate System Instructions</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what kind of AI assistant you want to create, and we'll generate appropriate system instructions."
              className="h-[200px] transition-all duration-200"
              disabled={isGenerating}
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span>Free beta</span>
              </span>
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
    </div>
  );
};

SystemInstructions.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SystemInstructions;
