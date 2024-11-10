import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/constants/fileConstants";

export function useFileHandler() {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

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

  const handleFileSelect = useCallback(
    (selectedFiles) => {
      const validFiles = Array.from(selectedFiles).filter(validateFile);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [validateFile]
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

  return {
    files,
    setFiles,
    uploadProgress,
    setUploadProgress,
    handleFileSelect,
    removeFile,
  };
} 