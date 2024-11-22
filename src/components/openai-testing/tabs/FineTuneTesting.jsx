import React, { useState } from 'react';
import { useOpenAI } from '@/hooks/use-openai';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function FineTuneTesting() {
  const { isInitialized } = useOpenAI();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    model: 'gpt-3.5-turbo',
    trainingFile: '',
    validationFile: '',
    epochs: 3,
    batchSize: 1
  });

  const handleFineTune = async () => {
    if (!isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI is not initialized',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await UnifiedOpenAIService.fineTuning.create({
        training_file: formData.trainingFile,
        validation_file: formData.validationFile,
        model: formData.model,
        hyperparameters: {
          n_epochs: formData.epochs,
          batch_size: formData.batchSize
        }
      });
      setResult(response);
      toast({
        title: 'Success',
        description: 'Fine-tune job created successfully'
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleFineTune();
        }} className="space-y-4">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={formData.model}
              onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="davinci">Davinci</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Training File ID</Label>
            <Input
              value={formData.trainingFile}
              onChange={(e) => setFormData(prev => ({ ...prev, trainingFile: e.target.value }))}
              placeholder="Enter training file ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Validation File ID (Optional)</Label>
            <Input
              value={formData.validationFile}
              onChange={(e) => setFormData(prev => ({ ...prev, validationFile: e.target.value }))}
              placeholder="Enter validation file ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Epochs</Label>
              <Input
                type="number"
                value={formData.epochs}
                onChange={(e) => setFormData(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                min={1}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Batch Size</Label>
              <Input
                type="number"
                value={formData.batchSize}
                onChange={(e) => setFormData(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                min={1}
                max={256}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.trainingFile}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Fine-tune
              </>
            ) : (
              'Create Fine-tune'
            )}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fine-tune Job Created</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-destructive">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-destructive">{error}</p>
        </Card>
      )}
    </div>
  );
} 