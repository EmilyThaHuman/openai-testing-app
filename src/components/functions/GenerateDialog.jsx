import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const GenerateDialog = ({ open, onOpenChange, onGenerate }) => {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
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
                  "You are a helpful assistant that generates OpenAI function schemas based on user descriptions. Always return valid JSON.",
              },
              {
                role: "user",
                content: `Generate an OpenAI function schema for the following description: ${description}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Failed to generate schema");

      const schema = data.choices[0].message.content;
      onGenerate(schema);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error generating schema",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred in generate dialog in generate dialog",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="transition-all duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle>Generate Function Schema</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your function does (or paste your code), and we'll generate a definition."
            className="h-[200px] transition-all duration-200"
            disabled={isLoading}
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
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            className="relative"
          >
            {isLoading ? (
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
  );
};

GenerateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};

export default GenerateDialog;
