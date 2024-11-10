import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useOpenAI } from '@/context/openaiContext';

export default function ModerationTesting() {
  const { apiKey } = useOpenAI();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleModeration = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await UnifiedOpenAIService.moderation.create({
        input: input
      });
      setResult(response.results[0]);
    } catch (error) {
      console.error('Moderation error:', error);
      setError(error.message);
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