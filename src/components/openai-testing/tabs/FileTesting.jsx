import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { FileUpload } from '@/components/shared/FileUpload';
import { Loader2, Trash2, Download, RefreshCw } from 'lucide-react';

export default function FileTesting() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await UnifiedOpenAIService.listFiles();
      setFiles(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setLoading(true);
    try {
      await UnifiedOpenAIService.uploadFile(uploadFile);
      await fetchFiles();
      setUploadFile(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    setLoading(true);
    try {
      await UnifiedOpenAIService.deleteFile(fileId);
      await fetchFiles();
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async (fileId) => {
    setLoading(true);
    try {
      const file = await UnifiedOpenAIService.retrieveFile(fileId);
      setSelectedFile(file);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 p-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">File Upload</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-4">
          <FileUpload
            accept=".jsonl,.txt,.pdf"
            onChange={setUploadFile}
            className="w-full"
          />
          <Button 
            onClick={handleUpload} 
            disabled={loading || !uploadFile}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : 'Upload File'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Files List</h2>
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        )}
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
            >
              <div className="flex-1">
                <p className="font-medium">{file.filename}</p>
                <p className="text-sm text-gray-500">
                  {file.bytes} bytes • {new Date(file.created_at * 1000).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRetrieve(file.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedFile && (
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">File Details</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(selectedFile, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
} 