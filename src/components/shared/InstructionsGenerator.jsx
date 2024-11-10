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
import { generateInstructions, GENERATOR_TYPES } from "../../utils/instructionsGenerator";

export const InstructionsGenerator = ({
  type = GENERATOR_TYPES.SYSTEM,
  value,
  onChange,
  title = "Instructions",
  placeholder = "Describe what kind of instructions you want to generate...",
}) => {
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

    try {
      await generateInstructions({
        type,
        description,
        apiKey,
        onStart: () => setIsGenerating(true),
        onSuccess: (result) => {
          onChange(result);
          setDialogOpen(false);
          toast({
            title: "Generation successful",
            description: `New ${type} instructions have been generated.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Generation failed",
            description: error,
            variant: "destructive",
          });
        },
        onComplete: () => setIsGenerating(false),
      });
    } catch (error) {
      // Error already handled by onError callback
      console.error(error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
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
          {[...Array(9)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 w-${["3/4", "1/2", "5/6", "2/3", "4/5"][i % 5]}`}
            />
          ))}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter or generate instructions..."
          className="min-h-[200px] resize-y"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate {title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={placeholder}
              className="h-[200px]"
              disabled={isGenerating}
            />
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

InstructionsGenerator.propTypes = {
  type: PropTypes.oneOf(Object.values(GENERATOR_TYPES)),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string,
  placeholder: PropTypes.string,
};

export default InstructionsGenerator;
