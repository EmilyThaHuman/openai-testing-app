import React, { useRef, useCallback } from "react";
import { useStoreSelector } from '@/store/useStore';
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ALLOWED_FILE_TYPES } from "@/constants/fileConstants";
import { useFileHandler } from "@/hooks/useFileHandler";
import FilePreview from "./FilePreview";
import { MessageInput } from "./MessageInput";

export function ChatInput() {
  const { toast } = useToast();
  const [input, setInput] = React.useState("");
  const fileInputRef = useRef(null);

  const {
    isLoading,
    error,
    sendMessage,
    uploadFile,
    uploadProgress,
    clearUploadProgress
  } = useStoreSelector(state => ({
    isLoading: state.isLoading,
    error: state.error,
    sendMessage: state.sendMessage,
    uploadFile: state.uploadFile,
    uploadProgress: state.uploadProgress,
    clearUploadProgress: state.clearUploadProgress
  }));

  const { files, setFiles, handleFileSelect, removeFile } = useFileHandler();

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if ((!input.trim() && files.length === 0) || isLoading) return;

    try {
      const uploadedFileIds = await Promise.all(
        files.map(file => uploadFile(file))
      );

      await sendMessage(input, uploadedFileIds.filter(Boolean));
      setInput("");
      setFiles([]);
      clearUploadProgress();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [input, files, isLoading, uploadFile, sendMessage, clearUploadProgress, toast]);

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

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

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
          disabled={isLoading}
          isUploading={isLoading}
          placeholder="Type your message..."
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

export default React.memo(ChatInput);
