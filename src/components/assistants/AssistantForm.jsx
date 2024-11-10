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

const AssistantForm = ({
  newAssistant,
  setNewAssistant,
  createAssistant,
  loading,
  toggleTool,
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

        <Textarea
          placeholder="Instructions"
          value={newAssistant.instructions}
          onChange={(e) =>
            setNewAssistant((prev) => ({
              ...prev,
              instructions: e.target.value,
            }))
          }
        />

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
