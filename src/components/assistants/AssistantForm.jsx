import { useState } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom Components
import { FileList } from '../shared/FileList';
import { FileUploader } from '../shared/FileUploader';
import { InstructionsGenerator } from '../shared/InstructionsGenerator';
import { FunctionsSection } from '../tools/functions/FunctionsSection';

// Constants and Types
import {
  DEFAULT_ASSISTANT,
  MODELS,
  TOOLS,
} from '@/constants/assistantConstants';
import { GENERATOR_TYPES } from '@/utils/instructionsGenerator';

// Form Schema
const assistantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string(),
  instructions: z.string(),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  response_format: z.string(),
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
              properties: z.record(z.any()),
              required: z.array(z.string()).optional(),
            }),
          })
          .optional(),
      })
    )
    .optional(),
  file_ids: z.array(z.string()).optional(),
  fileSearchEnabled: z.boolean().default(false),
});

const formAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function AssistantForm({ mode = 'create', assistant, onSubmit }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  // Store selectors
  const { selectedVectorStore, updateAssistant, createAssistant } =
    useStoreSelector(state => ({
      selectedVectorStore: state.selectedVectorStore,
      updateAssistant: state.updateAssistant,
      createAssistant: state.createAssistant,
    }));

  const isEdit = mode === 'edit';

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(assistantSchema),
    defaultValues: isEdit
      ? { ...DEFAULT_ASSISTANT, ...assistant }
      : DEFAULT_ASSISTANT,
  });

  // Watched values
  const tools = watch('tools') || [];
  const file_ids = watch('file_ids') || [];

  // Tool handling
  const toggleTool = toolId => {
    const currentTools = tools;
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter(t => t !== toolId)
      : [...currentTools, toolId];
    setValue('tools', newTools, { shouldDirty: true });
  };

  // File handling
  const handleFileUpload = async files => {
    try {
      setIsLoading(true);
      const uploadedFiles = await Promise.all(
        files.map(file =>
          UnifiedOpenAIService.files.create({
            file,
            purpose: 'assistants',
          })
        )
      );

      setValue('file_ids', [...file_ids, ...uploadedFiles.map(f => f.id)], {
        shouldDirty: true,
      });

      toast({
        title: 'Files uploaded successfully',
        description: `${files.length} files uploaded`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsFileDialogOpen(false);
    }
  };

  const handleFileRemove = fileId => {
    setValue(
      'file_ids',
      file_ids.filter(id => id !== fileId),
      { shouldDirty: true }
    );
  };

  // Form submission
  const onFormSubmit = async data => {
    try {
      setIsLoading(true);
      const formattedData = {
        ...data,
        tools: data.tools?.map(tool => ({ type: tool.type })) || [],
      };

      if (isEdit) {
        await updateAssistant(assistant.id, formattedData);
      } else {
        await createAssistant(formattedData);
      }

      toast({
        title: `Assistant ${isEdit ? 'updated' : 'created'} successfully`,
      });

      if (!isEdit) reset();
    } catch (error) {
      toast({
        title: `Failed to ${isEdit ? 'update' : 'create'} assistant`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={formAnimations}
    >
      <Card className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Assistant' : 'Create Assistant'}
          </h2>
          {isDirty && (
            <Badge variant="outline" className="text-yellow-500">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Form fields */}
          <FormSection title="Basic Information">
            <FormField
              control={control}
              name="name"
              label="Name"
              error={errors.name}
            />

            <FormField
              control={control}
              name="instructions"
              label="Instructions"
              component={InstructionsGenerator}
              type={GENERATOR_TYPES.SYSTEM}
              error={errors.instructions}
            />
          </FormSection>

          <FormSection title="Model & Response">
            <FormField
              control={control}
              name="model"
              label="Model"
              component={Select}
              options={MODELS}
              error={errors.model}
            />

            <FormField
              control={control}
              name="response_format"
              label="Response Format"
              component={Select}
              options={{
                text: 'Text',
                json_object: 'JSON',
              }}
              error={errors.response_format}
            />
          </FormSection>

          <FormSection title="Parameters">
            <FormField
              control={control}
              name="temperature"
              label="Temperature"
              component={Slider}
              min={0}
              max={2}
              step={0.1}
              error={errors.temperature}
            />

            <FormField
              control={control}
              name="top_p"
              label="Top P"
              component={Slider}
              min={0}
              max={1}
              step={0.1}
              error={errors.top_p}
            />
          </FormSection>

          <FormSection title="Tools & Capabilities">
            <div className="space-y-4">
              <ToolsGrid
                tools={TOOLS}
                selectedTools={tools}
                onToggle={toggleTool}
              />

              <FunctionsSection
                tools={TOOLS}
                assistantTools={tools}
                toggleTool={toggleTool}
                control={control}
              />
            </div>
          </FormSection>

          <FormSection title="Files">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch
                  checked={watch('fileSearchEnabled')}
                  onCheckedChange={checked =>
                    setValue('fileSearchEnabled', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFileDialogOpen(true)}
                  disabled={isLoading}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>

              <FileList files={file_ids} onRemove={handleFileRemove} />
            </div>
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading || !isDirty}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEdit ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>

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
    </motion.div>
  );
}

// Helper Components
const FormSection = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    {children}
  </div>
);

const FormField = ({
  control,
  name,
  label,
  component: Component = Input,
  error,
  ...props
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Component {...field} {...props} />
        {error && (
          <div className="flex items-center text-destructive text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error.message}
          </div>
        )}
      </div>
    )}
  />
);

const ToolsGrid = ({ tools, selectedTools, onToggle }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {Object.entries(tools).map(([id, name]) => (
      <Badge
        key={id}
        variant={selectedTools.some(t => t.type === id) ? 'default' : 'outline'}
        className="cursor-pointer transition-all hover:scale-105"
        onClick={() => onToggle(id)}
      >
        {name}
      </Badge>
    ))}
  </div>
);

export default AssistantForm;
