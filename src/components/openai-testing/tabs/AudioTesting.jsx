import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useOpenAI } from '@/context/openaiContext';

export default function AudioTesting() {
  const { apiKey } = useOpenAI();
  const [audioFile, setAudioFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('whisper-1');

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');

    try {
      const result = await UnifiedOpenAIService.audio.transcribe(
        audioFile,
        model
      );
      setResult(result.text);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');

    try {
      const result = await UnifiedOpenAIService.audio.translate(
        audioFile,
        model
      );
      setResult(result.text);
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Mode</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whisper-1">Whisper-1</SelectItem>
              <SelectItem value="whisper-2">Whisper-2</SelectItem>
              <SelectItem value="whisper-3">Whisper-3</SelectItem>
              <SelectItem value="whisper-4">Whisper-4</SelectItem>
              <SelectItem value="whisper-5">Whisper-5</SelectItem>
              <SelectItem value="whisper-6">Whisper-6</SelectItem>
              <SelectItem value="whisper-7">Whisper-7</SelectItem>
              <SelectItem value="whisper-8">Whisper-8</SelectItem>
              <SelectItem value="whisper-9">Whisper-9</SelectItem>
              <SelectItem value="whisper-10">Whisper-10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Audio File</Label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleTranscribe} 
          disabled={loading || !audioFile}
        >
          {loading ? 'Processing...' : 'Transcribe'}
        </Button>

        <Button 
          onClick={handleTranslate} 
          disabled={loading || !audioFile}
        >
          {loading ? 'Processing...' : 'Translate'}
        </Button>
      </div>

      {result && (
        <Card className="p-4">
          <Label>Result:</Label>
          <div className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
            {result}
          </div>
        </Card>
      )}
    </div>
  );
}