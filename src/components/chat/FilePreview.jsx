import React, { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { X, FileText, Image as ImageIcon, File } from 'lucide-react';

const FilePreview = memo(({ file, progress, onRemove }) => {
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="group flex items-center gap-1 bg-background p-1 rounded-md text-sm hover:bg-accent transition-colors">
      {getFileIcon(file.type)}
      <span className="max-w-[100px] truncate">{file.name}</span>
      {typeof progress === 'number' && (
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

FilePreview.displayName = 'FilePreview';

export default FilePreview; 