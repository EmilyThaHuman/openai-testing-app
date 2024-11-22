import { useCallback, useReducer } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/constants/fileConstants";

const fileReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.files]
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter((_, i) => i !== action.index),
        uploadProgress: Object.fromEntries(
          Object.entries(state.uploadProgress)
            .filter(([key]) => key !== state.files[action.index].name)
        )
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.fileName]: action.progress
        }
      };
    default:
      return state;
  }
};

export function useFileHandler() {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(fileReducer, {
    files: [],
    uploadProgress: {}
  });

  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 50MB limit`,
        variant: "destructive",
      });
      return false;
    }

    const isValidType = Object.keys(ALLOWED_FILE_TYPES).some((type) => 
      type.endsWith("*") 
        ? file.type.startsWith(type.slice(0, -1))
        : file.type === type
    );

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported file type`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const handleFileSelect = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(validateFile);
    if (validFiles.length > 0) {
      dispatch({ type: 'ADD_FILES', files: validFiles });
    }
  }, [validateFile]);

  const removeFile = useCallback((index) => {
    dispatch({ type: 'REMOVE_FILE', index });
  }, []);

  return {
    files: state.files,
    uploadProgress: state.uploadProgress,
    handleFileSelect,
    removeFile,
    updateProgress: useCallback((fileName, progress) => {
      dispatch({ type: 'UPDATE_PROGRESS', fileName, progress });
    }, [])
  };
} 