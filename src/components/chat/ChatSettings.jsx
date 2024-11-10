import React from 'react';
import { useChat } from '@/context/ChatContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ChatSettings() {
  const { activeChat, updateChatSettings } = useChat();

  if (!activeChat) return null;

  const handleSettingChange = (key, value) => {
    updateChatSettings(activeChat.id, {
      ...activeChat.settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Chat Settings</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="model">
          <AccordionTrigger>Model Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select 
                  value={activeChat.settings.model} 
                  onValueChange={(value) => handleSettingChange('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Temperature: {activeChat.settings.temperature}
                </Label>
                <Slider
                  value={[activeChat.settings.temperature]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('temperature', value)}
                />
              </div>

              {/* Add other model settings similar to ChatTesting */}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Add other settings sections similar to ChatTesting */}
      </Accordion>
    </div>
  );
} 