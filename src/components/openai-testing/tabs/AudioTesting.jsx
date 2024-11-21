import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AudioTesting() {
  const {
    audioFile,
    result,
    loading,
    error,
    model,
    setAudioFile,
    setModel,
    handleTranscribe,
    handleTranslate
  } = useStoreSelector(state => ({
    audioFile: state.audioFile,
    result: state.audioResult,
    loading: state.isProcessingAudio,
    error: state.audioError,
    model: state.audioModel,
    setAudioFile: state.setAudioFile,
    setModel: state.setAudioModel,
    handleTranscribe: state.transcribeAudio,
    handleTranslate: state.translateAudio
  }));

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
              {/* Add other models */}
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

        <div className="flex gap-2">
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