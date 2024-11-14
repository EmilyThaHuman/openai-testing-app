import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { DEFAULT_ASSISTANT } from '@/store/slices/assistantSlice';
import { useStoreShallow } from '@/store/useStore';
import { GENERATOR_TYPES } from '@/utils/instructionsGenerator';
import { FileUp } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { MODELS, TOOLS } from '../../constants/assistantConstants';
import { FileList } from '../shared/FileList';
import { FileUploader } from '../shared/FileUploader';
import InstructionsGenerator from '../shared/InstructionsGenerator';
import { FunctionsSection } from '../tools/functions/FunctionsSection';
import { Switch } from '../ui/switch';
import { useToast } from '@/components/ui/use-toast';

const assistantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string(),
  instructions: z.string(),
  temperature: z.number().min(0).max(1),
  assistantType: z.enum(['text-return', 'code-assistant']),
  file_ids: z.array(z.string()).optional(),
  fileSearchEnabled: z.boolean().default(false),
  max_tokens: z.number().min(1).max(32000),
  response_format: z.string(),
  functions: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.unknown()).optional(),
    })
  ),
  function_call: z.string(),
  stop: z.array(z.string()),
  top_p: z.number().min(0).max(1),
  presence_penalty: z.number().min(-2).max(2),
  tools: z
    .array(
      z.object({
        type: z.enum([
          'code_interpreter',
          'retrieval',
          'function',
          'file_search',
        ]),
        function: z
          .object({
            name: z.string(),
            description: z.string().optional(),
            parameters: z.object({
              type: z.literal('object'),
              properties: z.record(
                z.object({
                  type: z.string(),
                  description: z.string().optional(),
                  enum: z.array(z.string()).optional(),
                  items: z
                    .object({
                      type: z.string(),
                      properties: z.record(z.unknown()).optional(),
                    })
                    .optional(),
                })
              ),
              required: z.array(z.string()).optional(),
            }),
          })
          .optional(),
      })
    )
    .optional(),
});

const AssistantForm = ({
  mode,
  assistant,
  loading,
  isFileDialogOpen,
  setIsFileDialogOpen,
  onSubmit,
}) => {
  const store = useStoreShallow();
  const selectedVectorStore = store.selectedVectorStore;
  const isEdit = mode === 'edit';
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: DEFAULT_ASSISTANT,
  });

  // Load existing assistant data when in edit mode
  useEffect(() => {
    if (isEdit && assistant) {
      reset({
        ...DEFAULT_ASSISTANT,
        ...assistant,
      });
    }
  }, [isEdit, assistant, reset]);

  const fileSearchEnabled = watch('fileSearchEnabled');
  const codeInterpreterEnabled = watch('codeInterpreterEnabled');
  const tools = watch('tools') || [];
  const file_ids = watch('file_ids') || [];

  const toggleTool = toolId => {
    const currentTools = watch('tools') || [];
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter(t => t !== toolId)
      : [...currentTools, toolId];
    setValue('tools', newTools, { shouldDirty: true });
  };
  // File handling
  const handleFileUpload = async files => {
    try {
      if (files.length === 0) return;
      if (files.length === 1) {
        const file = await UnifiedOpenAIService.files.create({
          file: files[0],
          purpose: 'fine-tune',
        });
      }
      if (files.length > 1) {
        const fileStreams = files.map(path => fs.createReadStream(path));
        await UnifiedOpenAIService.beta.vectorStores.fileBatches.uploadAndPoll({
          vector_store_id: selectedVectorStore.id,
          file_batches: fileStreams,
        });
        await UnifiedOpenAIService.beta.assistants.update(assistant.id, {
          tool_resources: {
            file_search: { vector_store_ids: [selectedVectorStore.id] },
          },
        });
      }

      // Update form with new file IDs
      const currentFileIds = watch('file_ids') || [];
      setValue('file_ids', [...currentFileIds, ...file_ids], {
        shouldDirty: true,
      });

      toast({
        title: 'Files uploaded successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Failed to upload files',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFileRemove = fileId => {
    const currentFileIds = watch('file_ids') || [];
    setValue(
      'file_ids',
      currentFileIds.filter(id => id !== fileId),
      { shouldDirty: true }
    );
  };

  // Vector store handling
  const handleVectorStoreAttachment = async vectorStoreId => {
    try {
      setValue(
        'tools',
        [
          ...watch('tools'),
          {
            type: 'file_search',
            vector_store_id: vectorStoreId,
          },
        ],
        { shouldDirty: true }
      );

      toast({
        title: 'Vector store attached successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Failed to attach vector store',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async data => {
    setLoading(true);
    try {
      // Format the data for the API
      const formattedData = {
        ...data,
        tools: data.tools.map(tool => ({ type: tool.type })),
      };
      await onSubmit(formattedData);

      if (!isEdit) {
        reset(); // Only reset form on successful creation
      }

      toast({
        title: `Assistant ${isEdit ? 'updated' : 'created'} successfully`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: `Failed to ${isEdit ? 'update' : 'create'} assistant`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? 'Edit Assistant' : 'Create Assistant'}
      </h2>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div>
                <Label>Name</Label>
                <Input placeholder="Assistant Name" {...field} />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* System Instructions */}
          <Controller
            name="instructions"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>System Instructions</Label>
                <InstructionsGenerator
                  type={GENERATOR_TYPES.SYSTEM}
                  value={field.value}
                  onChange={field.onChange}
                  title="System Instructions"
                  placeholder="Enter system instructions"
                />
                {errors.instructions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.instructions.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Tools: File Search Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>File Search</Label>
                <Controller
                  name="fileSearchEnabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
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
              <FileList files={file_ids} onRemove={handleFileRemove} />
            </div>
          </div>

          {/* Tools: Code Interpreter Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label>Code Interpreter</Label>
              <Switch
                checked={tools.some(t => t.type === 'code_interpreter')}
                onCheckedChange={() => toggleTool('code_interpreter')}
              />
            </div>
          </div>

          {/* Tools: Functions Section */}
          <FunctionsSection
            tools={TOOLS}
            assistantTools={tools}
            toggleTool={toggleTool}
            control={control}
          />

          {/* Model Selection */}
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={field.value} onValueChange={field.onChange}>
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
                {errors.model && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.model.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Tools Selection */}
          <div className="space-y-2">
            <Label>Tools</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TOOLS).map(([id, name]) => (
                <Badge
                  key={id}
                  variant={
                    tools.some(t => t.type === id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTool(id)}
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <Controller
            name="temperature"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Temperature: {field.value}</Label>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => field.onChange(value)}
                />
                {errors.temperature && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.temperature.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Top P Slider */}
          <Controller
            name="top_p"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Top P: {field.value}</Label>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => field.onChange(value)}
                />
                {errors.top_p && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.top_p.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Response Format */}
          <Controller
            name="response_format"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Response Format</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json_object">JSON</SelectItem>
                  </SelectContent>
                </Select>
                {errors.response_format && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.response_format.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
                ? 'Update Assistant'
                : 'Create Assistant'}
          </Button>
        </div>
      </form>

      {/* File Upload Dialog */}
      <FileUploader
        open={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onUpload={handleFileUpload}
        accept={{
          'application/pdf': ['.pdf'],
          'text/plain': ['.txt'],
          'text/markdown': ['.md'],
        }}
        multiple
      />
    </Card>
  );
};

export { assistantSchema };
export default AssistantForm;
