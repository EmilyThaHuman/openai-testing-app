import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge class names
const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// Enhanced Loading Spinner
export const LoadingSpinner = ({ size = "default", className }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center"
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          className
        )}
      />
    </motion.div>
  );
};

// Enhanced Error Message
export const ErrorMessage = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500">Error</AlertTitle>
        <AlertDescription className="text-red-400">
          {typeof error === "string"
            ? error
            : error.message || "An unexpected error occurred"}
        </AlertDescription>
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
          >
            Retry
          </motion.button>
        )}
      </Alert>
    </motion.div>
  );
};

// Enhanced Success Message
export const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Success</AlertTitle>
        <AlertDescription className="text-green-400">
          {message}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

// Enhanced Progress Indicator with Animation
export const AnimatedProgress = ({ progress, label }) => {
  const [displayedProgress, setDisplayedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative pt-1">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-semibold text-primary inline-block">
            {label}
          </div>
          <div className="text-xs font-semibold text-primary inline-block">
            {displayedProgress}%
          </div>
        </div>
      )}
      <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
        />
      </div>
    </div>
  );
};

// Enhanced Loading State with Pulse Animation
export const ContentLoader = ({ className }) => (
  <div className={cn("animate-pulse space-y-4", className)}>
    <div className="h-4 bg-primary/10 rounded w-3/4" />
    <div className="space-y-2">
      <div className="h-4 bg-primary/10 rounded" />
      <div className="h-4 bg-primary/10 rounded w-5/6" />
    </div>
  </div>
);

// Enhanced Status Badge
export const StatusBadge = ({ status, text }) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      className: "text-green-500 bg-green-500/10",
    },
    error: {
      icon: XCircle,
      className: "text-red-500 bg-red-500/10",
    },
    warning: {
      icon: AlertCircle,
      className: "text-yellow-500 bg-yellow-500/10",
    },
    loading: {
      icon: Loader2,
      className: "text-blue-500 bg-blue-500/10",
    },
  };

  const config = statusConfig[status] || statusConfig.warning;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      <Icon
        className={cn("w-3 h-3 mr-1", status === "loading" && "animate-spin")}
      />
      {text}
    </motion.div>
  );
};

// Layout Transition Component
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// Notification Toast Component
export const Toast = ({ type = "info", message, onClose }) => {
  const toastConfig = {
    info: { icon: AlertCircle, className: "bg-blue-500" },
    success: { icon: CheckCircle, className: "bg-green-500" },
    error: { icon: XCircle, className: "bg-red-500" },
  };

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={cn(
        "rounded-lg p-4 flex items-center text-white shadow-lg",
        config.className
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-80">
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
};

export default {
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage,
  AnimatedProgress,
  ContentLoader,
  StatusBadge,
  PageTransition,
  Toast,
};
