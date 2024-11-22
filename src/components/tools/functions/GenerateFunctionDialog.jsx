// GenerateDialog.js
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useContentPart } from '@/hooks/useContentPart';
import { tryJsonParse } from '@/lib/utils/tryJsonParse';
import { Editor } from '@monaco-editor/react'; // Ensure you have this package installed
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

const monacoOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'off',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  renderValidationDecorations: 'on',
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  wordWrap: 'on',
};

const MonacoEditorWrapper = ({
  value,
  onChange,
  language = 'json',
  height = '120px',
}) => (
  <Editor
    height={height}
    language={language}
    value={value}
    onChange={onChange}
    options={monacoOptions}
    className="border rounded-md bg-background"
    beforeMount={monaco => {
      monaco.editor.defineTheme('customTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e1e',
        },
      });
      monaco.editor.setTheme('customTheme');
    }}
  />
);

MonacoEditorWrapper.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  language: PropTypes.string,
  height: PropTypes.string,
};

export const GenerateFunctionDialog = ({ open, onOpenChange, onGenerate }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const part = useContentPart(); // Ensure this hook is defined and provides 'argsText', 'args', and 'result'
  const [argsValue, setArgsValue] = useState('');
  const [resultValue, setResultValue] = useState('');

  // Initialize argsValue and resultValue based on 'part'
  useEffect(() => {
    setArgsValue(part.argsText ?? JSON.stringify(part.args, null, 2));
    setResultValue(
      !part.result
        ? ''
        : typeof part.result === 'string'
          ? part.result
          : JSON.stringify(part.result, null, 2)
    );
  }, [part]);

  const handleGenerate = useCallback(async () => {
    const apiKey = localStorage.getItem('openai_api_key');

    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please add your OpenAI API key in the header first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that generates OpenAI function schemas based on user descriptions. Always return valid JSON.',
              },
              {
                role: 'user',
                content: `Generate an OpenAI function schema for the following description: ${description}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate schema');
      }

      const schema = data.choices[0]?.message?.content;
      if (!schema) {
        throw new Error('No schema returned from OpenAI.');
      }

      onGenerate(schema);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error Generating Schema',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [description, onGenerate, onOpenChange, toast]);

  const handleArgsChange = useCallback(
    value => {
      setArgsValue(value);
      part.argsText = value;
      part.args = tryJsonParse(value);
    },
    [part]
  );

  const handleResultChange = useCallback(
    value => {
      setResultValue(value);
      part.result = value;
    },
    [part]
  );

  const handleDescriptionChange = useCallback(e => {
    setDescription(e.target.value);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="transition-all duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle>Generate Function Schema</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Description Input */}
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe what your function does (or paste your code), and we'll generate a definition."
            className="h-40 w-full mb-4"
            disabled={isLoading}
          />

          {/* Generated Schema Display */}
          <div className="font-mono text-sm overflow-auto max-h-[60vh] bg-[#1E1E1E] rounded-md p-4 border border-gray-700">
            <MonacoEditorWrapper
              value={resultValue}
              onChange={handleResultChange}
              language="json"
              height="200px"
            />
          </div>

          {/* Optional Args Editor */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Arguments</h4>
            <MonacoEditorWrapper
              value={argsValue}
              onChange={handleArgsChange}
              language="json"
              height="150px"
            />
          </div>

          {/* Beta Notice */}
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
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

GenerateFunctionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};

export default GenerateFunctionDialog;
