import { useStoreSelector } from '@/store/useStore';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { X, Info } from 'lucide-react';

export function SettingsPanel() {
  const {
    activeChat,
    updateChatSettings,
    models,
    getSettingInfo,
    toggleSettings
  } = useStoreSelector(state => ({
    activeChat: state.activeChat,
    updateChatSettings: state.updateChatSettings,
    models: state.models,
    getSettingInfo: state.getSettingInfo,
    toggleSettings: state.toggleSettings
  }));

  if (!activeChat) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l shadow-lg z-30"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chat Settings</h2>
        <Button variant="ghost" size="icon" onClick={toggleSettings}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] p-4">
        <Accordion type="single" collapsible defaultValue="model">
          {/* Model Selection */}
          <AccordionItem value="model">
            <AccordionTrigger>Model</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Select
                  value={activeChat.settings.model}
                  onValueChange={(value) => 
                    updateChatSettings(activeChat.id, { model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.context_length}k tokens
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getSettingInfo('model')}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Temperature Control */}
          <AccordionItem value="temperature">
            <AccordionTrigger>Temperature</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Randomness</Label>
                  <span className="text-sm text-muted-foreground">
                    {activeChat.settings.temperature.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[activeChat.settings.temperature]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => 
                    updateChatSettings(activeChat.id, { temperature: value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {getSettingInfo('temperature')}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* System Instructions */}
          <AccordionItem value="instructions">
            <AccordionTrigger>System Instructions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Instructions</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Define the AI's behavior and context
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <textarea
                  value={activeChat.settings.systemPrompt}
                  onChange={(e) => 
                    updateChatSettings(activeChat.id, { 
                      systemPrompt: e.target.value 
                    })
                  }
                  className="w-full h-32 p-2 text-sm rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter system instructions..."
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced Settings */}
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={activeChat.settings.maxTokens}
                      onChange={(e) => 
                        updateChatSettings(activeChat.id, { 
                          maxTokens: parseInt(e.target.value) 
                        })
                      }
                      className="w-20 h-8"
                      min={1}
                      max={32000}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSettingInfo('maxTokens')}
                  </p>
                </div>

                {/* Top P */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Top P</Label>
                    <Slider
                      value={[activeChat.settings.topP]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([value]) => 
                        updateChatSettings(activeChat.id, { topP: value })
                      }
                      className="w-[120px]"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSettingInfo('topP')}
                  </p>
                </div>

                {/* Stream Response */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Stream Response</Label>
                    <p className="text-sm text-muted-foreground">
                      Show response as it's generated
                    </p>
                  </div>
                  <Switch
                    checked={activeChat.settings.stream}
                    onCheckedChange={(checked) => 
                      updateChatSettings(activeChat.id, { stream: checked })
                    }
                  />
                </div>

                {/* Function Calling */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Function Calling</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to use custom functions
                    </p>
                  </div>
                  <Switch
                    checked={activeChat.settings.functions}
                    onCheckedChange={(checked) => 
                      updateChatSettings(activeChat.id, { functions: checked })
                    }
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </motion.div>
  );
} 