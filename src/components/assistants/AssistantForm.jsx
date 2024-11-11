import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MODELS, TOOLS } from "../../constants/assistantConstants";
import InstructionsGenerator from "../shared/InstructionsGenerator";
import { GENERATOR_TYPES } from "@/utils/instructionsGenerator";
import { Switch } from "../ui/switch";
import { FileUp } from "lucide-react";

const AssistantForm = ({
  newAssistant,
  setNewAssistant,
  createAssistant,
  loading,
  toggleTool,
  isFileDialogOpen,
  setIsFileDialogOpen,
}) => {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Assistant</h2>
      <div className="space-y-4">
        <Input
          placeholder="Assistant Name"
          value={newAssistant.name}
          onChange={(e) =>
            setNewAssistant((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        {/* <Textarea
          placeholder="Instructions"
          value={newAssistant.instructions}
          onChange={(e) =>
            setNewAssistant((prev) => ({
              ...prev,
              instructions: e.target.value,
            }))
          }
        /> */}
        {/* System Instructions */}
        <div className="space-y-2">
          <Label>System Instructions</Label>
          <InstructionsGenerator
            type={GENERATOR_TYPES.SYSTEM}
            value={newAssistant.instructions}
            onChange={(value) =>
              setNewAssistant({ ...newAssistant, instructions: value })
            }
            title="System Instructions"
            placeholder="Enter system instructions"
          />
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>File search</Label>
              <Switch
                checked={newAssistant.file_search_enabled}
                onCheckedChange={(checked) =>
                  setNewAssistant({
                    ...newAssistant,
                    file_search_enabled: checked,
                  })
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFileDialogOpen(true)}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Files
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Files</Label>
            {/* <FileList files={newAssistant.file_ids} /> */}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={newAssistant.model}
            onValueChange={(value) =>
              setNewAssistant((prev) => ({ ...prev, model: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODELS).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tools</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TOOLS).map(([id, name]) => (
              <Badge
                key={id}
                variant={
                  newAssistant.tools.includes(id) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleTool(id)}
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Temperature: {newAssistant.temperature}</Label>
          <Slider
            value={[newAssistant.temperature]}
            min={0}
            max={2}
            step={0.1}
            onValueChange={([value]) =>
              setNewAssistant((prev) => ({ ...prev, temperature: value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Top P: {newAssistant.top_p}</Label>
          <Slider
            value={[newAssistant.top_p]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) =>
              setNewAssistant((prev) => ({ ...prev, top_p: value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Response Format</Label>
          <Select
            value={newAssistant.response_format.type}
            onValueChange={(value) =>
              setNewAssistant((prev) => ({
                ...prev,
                response_format: { type: value },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="json_object">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={createAssistant} disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Assistant"}
        </Button>
      </div>
    </Card>
  );
};

export default AssistantForm;
