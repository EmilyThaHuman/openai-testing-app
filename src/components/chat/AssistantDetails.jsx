import React, { useState, useCallback } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Edit2,
  Save,
  X,
  Loader2,
  Code,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_MODELS, MODEL_DETAILS } from '@/constants/aiModels';

export function AssistantDetails({ assistant, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssistant, setEditedAssistant] = useState(assistant);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { isLoading, error } = useStoreSelector(state => ({
    isLoading: state.isLoading,
    error: state.error
  }));

  const toolIcons = {
    'code_interpreter': <Code className="h-4 w-4" />,
    'retrieval': <FileText className="h-4 w-4" />,
    'function': <MessageSquare className="h-4 w-4" />
  };

  const handleEdit = useCallback(() => {
    setEditedAssistant(assistant);
    setIsEditing(true);
  }, [assistant]);

  const handleCancel = useCallback(() => {
    setEditedAssistant(assistant);
    setIsEditing(false);
  }, [assistant]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await onUpdate(editedAssistant);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Assistant details updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [editedAssistant, onUpdate, toast]);

  const handleInputChange = useCallback((field, value) => {
    setEditedAssistant(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  if (!assistant) return null;

  return (
    <Card className="p-4 space-y-4">
      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={editedAssistant.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Assistant name"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editedAssistant.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Assistant description"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select
              value={editedAssistant.model}
              onValueChange={(value) => handleInputChange('model', value)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{assistant.name}</h3>
              <p className="text-sm text-muted-foreground">
                {assistant.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Model: {assistant.model}
            </Badge>
            {assistant.tools?.map((tool) => (
              <Badge key={tool.type} variant="outline">
                {toolIcons[tool.type]}
                <span className="ml-1">{tool.type}</span>
              </Badge>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default React.memo(AssistantDetails); 