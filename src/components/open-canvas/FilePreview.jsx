import { memo } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getFileIcon, getFileLanguage } from '@/lib/utils/files';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';;

export const FilePreview = memo(function FilePreview({
  file,
  progress,
  onRemove,
}) {
  if (!file) return null;

  const FileIcon = getFileIcon(file.name);
  const language = getFileLanguage(file.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{file.name}</h3>
        </div>
        <Badge variant="outline">{language}</Badge>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Created {formatDistanceToNow(new Date(file.createdAt))} ago</p>
        <p>Updated {formatDistanceToNow(new Date(file.updatedAt))} ago</p>
        <p>{file.content?.length || 0} characters</p>
      </div>

      <ScrollArea className="h-[200px] border rounded-md bg-muted/50">
        <pre className="p-4 text-sm">
          <code>{file.content}</code>
        </pre>
      </ScrollArea>
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
    </motion.div>
  );
});
