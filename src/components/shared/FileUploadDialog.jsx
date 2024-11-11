import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { Progress } from "../ui/progress";

export function FileUploadDialog({
  open,
  onClose,
  onUpload,
  purpose = "assistants",
  uploadProgress,
  setUploadProgress,
  uploading,
  setUploading,
}) {
  const [files, setFiles] = useState([]);

  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Filter out unsupported files
      const supportedFiles = acceptedFiles.filter((file) => {
        const isSupported = [
          "text/plain",
          "application/pdf",
          "application/json",
          "text/markdown",
          "text/csv",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type);

        if (!isSupported) {
          toast({
            title: "Unsupported file type",
            description: `${file.name} is not a supported file type.`,
            variant: "destructive",
          });
        }

        return isSupported;
      });

      setFiles((prev) => [...prev, ...supportedFiles]);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024, // 20MB
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/json": [".json"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const handleUpload = async () => {
    try {
      setUploading(true);

      // Initialize progress for each file
      const initialProgress = files.reduce((acc, file) => {
        acc[file.name] = 0;
        return acc;
      }, {});
      setUploadProgress(initialProgress);

      // Process files in sequence to maintain better control
      const processedFiles = [];
      for (const file of files) {
        try {
          // Update progress for current file
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 10, // Started processing
          }));

          // Create file with metadata
          const fileWithMetadata = new File([file], file.name, {
            type: file.type,
          });

          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 50, // File processed
          }));

          processedFiles.push(fileWithMetadata);

          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100, // File ready
          }));
        } catch (error) {
          toast({
            title: `Failed to process ${file.name}`,
            description: error.message,
            variant: "destructive",
          });
        }
      }

      // Upload all processed files
      await onUpload(processedFiles);

      setFiles([]);
      onClose();
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${processedFiles.length} files.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      {uploading && uploadProgress[file.name] !== undefined && (
                        <div className="w-24 mr-2">
                          <Progress
                            value={uploadProgress[file.name]}
                            className="h-1"
                          />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-gray-200"}
              ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <input {...getInputProps()} disabled={uploading} />
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-sm">
                {isDragActive ? (
                  "Drop files here..."
                ) : (
                  <>
                    Drag files here or{" "}
                    <span className="text-primary">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported files: PDF, TXT, JSON, MD, CSV, DOC, DOCX (up to 20MB)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

FileUploadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  purpose: PropTypes.string,
};

export default { FileUploadDialog };
