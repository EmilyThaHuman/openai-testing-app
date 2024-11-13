import React, { Suspense } from 'react';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from './ErrorBoundary';

export function SuspenseBoundary({ children, fallback }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center h-[50vh]">
              <Progress className="w-[60%] max-w-md" />
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
} 