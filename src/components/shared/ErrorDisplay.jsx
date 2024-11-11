import { AlertCircle } from 'lucide-react';

export function ErrorDisplay({ error }) {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : 
    typeof error === 'string' ? error : 
    'An unexpected error occurred';

  return (
    <div className="p-4 bg-destructive/15 text-destructive rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{errorMessage}</p>
      </div>
    </div>
  );
} 