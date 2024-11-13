import { Plus, Settings2, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../ui/use-toast";
import { FunctionsList } from "./FunctionsList";
import GenerateFunctionDialog from "./GenerateFunctionDialog";
import { ToolCard } from "../ToolCard";
import { FunctionItem } from "./FunctionItem";

export const FunctionsSection = () => {
  const [functions, setFunctions] = useState([]);
  const [functionDefinition, setFunctionDefinition] = useState("");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [functionCallingEnabled, setFunctionCallingEnabled] = useState(false);
  const { toast } = useToast();

  const validateFunctionSchema = (schema) => {
    if (!schema || typeof schema !== "object") {
      throw new Error("Invalid JSON: must be an object");
    }
    if (!schema.name || typeof schema.name !== "string") {
      throw new Error("Function must have a 'name' property of type string");
    }
    if (!schema.description || typeof schema.description !== "string") {
      throw new Error(
        "Function must have a 'description' property of type string"
      );
    }
    if (!schema.parameters || typeof schema.parameters !== "object") {
      throw new Error(
        "Function must have a 'parameters' property of type object"
      );
    }
    return true;
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(functionDefinition);
      validateFunctionSchema(parsed);

      setFunctions([...functions, parsed.name]);
      toast({
        title: "Function added",
        description: `Successfully added function "${parsed.name}"`,
      });
      setFunctionDefinition("");
    } catch (error) {
      let errorMessage = "Invalid JSON format";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Invalid function definition",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
              <ToolCard
        title="Functions"
        enabled={functionCallingEnabled}
        onToggle={setFunctionCallingEnabled}
        tooltipContent="Enable function calling"
        buttonText="Functions"
        buttonIcon={Plus}
        onAdd={() => setIsGenerateOpen(true)}
      >
          {/* Code Files List */}
        <div className="space-y-2">
            {functions.map((func, index) => (
            <FunctionItem key={index} name={func} />
          ))}
          </div>
        </ToolCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Functions</h3>
        <Settings2 className="h-4 w-4" />
      </div>

      <FunctionsList functions={functions} />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add function</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              The model will intelligently decide to call functions based on
              input it receives from the user.{" "}
              <a href="#" className="text-primary hover:underline">
                Learn more
              </a>
              .
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Definition</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsGenerateOpen(true)}
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </Button>
                  <Button variant="outline">Examples</Button>
                </div>
              </div>
              <Textarea
                value={functionDefinition}
                onChange={(e) => setFunctionDefinition(e.target.value)}
                className="font-mono text-sm h-[400px]"
                placeholder='{
                    "name": "get_weather",
                    "description": "Get the weather in a given location",
                    "parameters": {
                      "type": "object",
                      "properties": {
                        "location": {
                          "type": "string",
                          "description": "The location to get weather for"
                        }
                      },
                      "required": ["location"]
                    }
                  }'
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Add</span>
                <code className="bg-gray-100 px-1 rounded">&quot;strict&quot;: true</code>
                <span>
                  to ensure the model&apos;s response always follows this schema.
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenerateFunctionDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onGenerate={setFunctionDefinition}
      />
    </div>
  );
};
