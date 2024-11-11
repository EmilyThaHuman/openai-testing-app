import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  FileText,
  Trash2,
  ChevronDown,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export const FileManagement = ({ onAttach, onCancel }) => {
  const [files, setFiles] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chunkSize, setChunkSize] = useState(800);
  const [chunkOverlap, setChunkOverlap] = useState(400);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      name: file.name,
      size: file.size,
      file,
      status: "uploading",
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload status changes
    newFiles.forEach((fileData) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === fileData.name
              ? { ...f, status: Math.random() > 0.8 ? "failed" : "uploaded" }
              : f
          )
        );
      }, 1000);
    });
  };

  const removeFile = (fileName) => {
    setFiles(files.filter((f) => f.name !== fileName));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = () => {
    return new Date().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg w-[440px] p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Attach files to file search
      </h2>

      <div className="space-y-1">
        <div className="grid grid-cols-[1fr,80px,80px,32px] items-center text-sm text-gray-500 px-1">
          <div>FILE</div>
          <div>SIZE</div>
          <div>UPLOADED</div>
          <div></div>
        </div>

        <div className="space-y-1">
          {files.map((file) => (
            <div
              key={file.name}
              className="grid grid-cols-[1fr,80px,80px,32px] items-center py-2 px-1"
            >
              <div className="flex items-center space-x-2">
                {file.status === "failed" ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-400" />
                )}
                <span
                  className={`text-sm ${
                    file.status === "failed" ? "text-red-500" : "text-gray-900"
                  }`}
                >
                  {file.name}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </div>
              <div className="text-sm text-gray-500">
                {file.status === "failed"
                  ? "Failed"
                  : file.status === "uploaded"
                    ? formatDate()
                    : "..."}
              </div>
              <button
                onClick={() => removeFile(file.name)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        <label className="block">
          <div className="flex items-center justify-center h-12 bg-gray-50 rounded border border-dashed border-gray-200 hover:bg-gray-100 cursor-pointer">
            <Plus className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Add</span>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />
        </label>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-gray-700 hover:text-gray-900"
        >
          Advanced options
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Chunk size (tokens)
                  </span>
                  <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                </div>
                <span className="text-sm text-gray-900">{chunkSize}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Chunk overlap (tokens)
                  </span>
                  <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                </div>
                <span className="text-sm text-gray-900">{chunkOverlap}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="secondary"
          className="text-gray-700 bg-gray-100 hover:bg-gray-200"
          onClick={() => onCancel?.()}
        >
          Cancel
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={() => onAttach?.(files, { chunkSize, chunkOverlap })}
        >
          Attach
        </Button>
      </div>
    </div>
  );
};

export default FileManagement;
