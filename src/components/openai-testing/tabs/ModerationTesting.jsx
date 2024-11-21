import React, { useState } from 'react';
import { useOpenAI } from '@/hooks/use-openai';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function ModerationTesting() {
  const { isInitialized } = useOpenAI();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleModeration = async () => {
    if (!isInitialized) {
      toast({
        title: 'Error',
        description: 'OpenAI is not initialized',
        variant: 'destructive'
      });
      return;
    }

    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await UnifiedOpenAIService.moderation.create({
        input: input
      });
      setResult(response.results[0]);
      toast({
        title: 'Success',
        description: 'Content moderated successfully'
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="moderation-input">Text to Moderate</Label>
        <Textarea
          id="moderation-input"
          placeholder="Enter text to check for content moderation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />
      </div>

      <Button 
        onClick={handleModeration} 
        disabled={loading || !input.trim()}
      >
        {loading ? 'Checking...' : 'Check Content'}
      </Button>

      {result && (
        <Card className="p-4 mt-4">
          <Label>Results:</Label>
          <pre className="mt-2 whitespace-pre-wrap bg-muted p-4 rounded-md">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      {error && (
        <Card className="p-4 mt-4">
          <Label>Error:</Label>
          <pre className="mt-2 whitespace-pre-wrap bg-muted p-4 rounded-md">
            {error}
          </pre>
        </Card>
      )}
    </div>
  );
} 