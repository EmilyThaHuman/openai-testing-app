import { cn } from '@/lib/utils';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  ...props
}) {
  // Add .webp extension if not already present
  const webpSrc = src.endsWith('.webp') ? src : `${src}.webp`;

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={cn('object-cover', className)}
        {...props}
      />
    </picture>
  );
}
