import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Paperclip,
  Send,
  Loader2,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = {
  "image/*": "Images",
  "application/pdf": "PDFs",
  "text/plain": "Text files",
  "text/csv": "CSV files",
  "application/json": "JSON files",
  "application/msword": "Word documents",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word documents",
};

const FilePreview = React.memo(({ file, progress, onRemove }) => {
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="group flex items-center gap-1 bg-background p-1 rounded-md text-sm hover:bg-accent transition-colors">
      {getFileIcon(file.type)}
      <span className="max-w-[100px] truncate">{file.name}</span>
      {typeof progress === "number" && (
        <Progress value={progress} className="w-16 h-1" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

export function ChatInput({
  onSend,
  onFileUpload,
  disabled = false,
  placeholder = "Type your message...",
  uploadedFiles = [],
}) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        return false;
      }

      const isValidType = Object.keys(ALLOWED_FILE_TYPES).some((type) => {
        if (type.endsWith("*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    },
    [toast]
  );

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && files.length === 0) || isUploading) return;

    setIsUploading(true);
    try {
      // Upload files first if any
      const uploadedFileIds = await Promise.all(
        files.map(async (file) => {
          try {
            const response = await onFileUpload?.(file);
            return response?.id;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            throw new Error(`Failed to upload ${file.name}`);
          }
        })
      );

      // Filter out any failed uploads
      const successfulUploads = uploadedFileIds.filter(Boolean);

      // Send message with uploaded file IDs
      await onSend?.(input, successfulUploads);
      
      // Clear message and files on success
      setInput("");
      setFiles([]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = useCallback(
    (selectedFiles) => {
      const validFiles = Array.from(selectedFiles).filter(validateFile);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [validateFile]
  );

  const handleFileInput = useCallback(
    (e) => {
      handleFileSelect(e.target.files);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(
    (index) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[files[index].name];
        return newProgress;
      });
    },
    [files]
  );

  const handlePaste = useCallback(
    (e) => {
      const items = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile());

      if (items.length > 0) {
        e.preventDefault();
        handleFileSelect(items);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {files.length > 0 && (
        <ScrollArea className="max-h-[100px]">
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                progress={uploadProgress[file.name]}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "min-h-[20px] max-h-[200px] pr-20",
              "resize-none overflow-hidden",
              "focus:ring-1 focus:ring-primary"
            )}
            disabled={disabled || isUploading}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={
                disabled || isUploading || (!input.trim() && files.length === 0)
              }
              title="Send message"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileInput}
        accept={Object.keys(ALLOWED_FILE_TYPES).join(",")}
      />
    </form>
  );
}
