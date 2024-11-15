export function DotPattern({ className = '', ...props }) {
  return (
    <div 
      className={`absolute inset-0 -z-10 h-full w-full bg-background ${className}`} 
      {...props}
    >
      <div 
        className="absolute h-full w-full"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, transparent, black)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent, black)'
        }}
      />
    </div>
  )
} 