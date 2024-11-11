export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = {
  "image/*": "Images",
  "application/pdf": "PDFs",
  "text/plain": "Text files",
  "text/csv": "CSV files",
  "application/json": "JSON files",
  "application/msword": "Word documents",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word documents",
};

export const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
