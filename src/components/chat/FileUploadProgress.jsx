import { Paperclip } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function FileUploadProgress({ file, progress }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Paperclip className="w-4 h-4" />
      <span className="flex-1 truncate">{file.name}</span>
      <Progress value={progress} className="w-24" />
      <span>{progress}%</span>
    </div>
  );
}
