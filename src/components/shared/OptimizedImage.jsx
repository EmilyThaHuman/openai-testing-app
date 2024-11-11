import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className,
  width,
  height,
  priority = false,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
    }
  }, [src, priority]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          error ? 'hidden' : 'block'
        )}
        {...props}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Error loading image
        </div>
      )}
    </div>
  );
}); 