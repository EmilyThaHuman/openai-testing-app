import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { Loader2, RefreshCw } from 'lucide-react';
import { useOpenAI } from '@/context/openaiContext';

export default function FineTuneTesting() {
  const { apiKey } = useOpenAI();
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (apiKey) {
      fetchJobs();
    }
  }, [apiKey]);

  const fetchJobs = async () => {
    try {
      const response = await UnifiedOpenAIService.fineTuning.list();
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const response = await UnifiedOpenAIService.files.upload(file, 'fine-tune');
      setFile(response);
    } catch (error) {
      console.error('File upload error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createFineTuningJob = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      await UnifiedOpenAIService.fineTuning.create({
        training_file: file.id,
        model,
      });
      await fetchJobs();
    } catch (error) {
      console.error('Fine-tuning error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 p-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Fine-tune</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchJobs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Training File</Label>
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Model</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <Button
            onClick={createFineTuningJob}
            disabled={loading || !file}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : 'Create Fine-tune'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Fine-tunes List</h2>
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        )}
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{job.fine_tuned_model || 'Processing...'}</p>
                  <p className="text-sm text-gray-500">Status: {job.status}</p>
                </div>
                <div className="flex gap-2">
                  {job.fine_tuned_model && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModel(job.fine_tuned_model);
                      }}
                    >
                      Delete Model
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 