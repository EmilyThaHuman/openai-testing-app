import React, { useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ALLOWED_FILE_TYPES } from "@/constants/fileConstants";
import { useFileHandler } from "@/hooks/useFileHandler";
import FilePreview from "./FilePreview";
import { MessageInput } from "./MessageInput";

export function ChatInput({
  onSend,
  onFileUpload,
  disabled = false,
  placeholder = "Type your message...",
}) {
  const { toast } = useToast();
  const [input, setInput] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef(null);

  const {
    files,
    setFiles,
    uploadProgress,
    handleFileSelect,
    removeFile,
  } = useFileHandler();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && files.length === 0) || isUploading) return;

    setIsUploading(true);
    try {
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

      const successfulUploads = uploadedFileIds.filter(Boolean);
      await onSend?.(input, successfulUploads);
      
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

  const handleFileInput = useCallback(
    (e) => {
      handleFileSelect(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
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
        <MessageInput
          input={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          onFileClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          isUploading={isUploading}
          placeholder={placeholder}
          hasContent={input.trim() || files.length > 0}
        />
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
