import { Loader2 } from "lucide-react";

export function Loading({ className = "", size = "default" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${className}`} 
      />
    </div>
  );
} 