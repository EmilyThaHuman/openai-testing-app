import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.NODE_ENV || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.extraErrorDataIntegration({
      depth: 3
    })
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Create logger interface
const logger = {
  error: (message, extra = {}) => {
    console.error(message);
    Sentry.captureException(message instanceof Error ? message : new Error(message), {
      extra
    });
  },
  
  warn: (message, extra = {}) => {
    console.warn(message);
    Sentry.captureMessage(message, {
      level: 'warning',
      extra
    });
  },
  
  info: (message, extra = {}) => {
    console.info(message);
    Sentry.captureMessage(message, {
      level: 'info',
      extra
    });
  },
  
  debug: (message, extra = {}) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.debug(message);
      Sentry.captureMessage(message, {
        level: 'debug',
        extra
      });
    }
  },

  // Helper to create module-specific loggers
  createModuleLogger: (module) => {
    return {
      error: (msg, extra = {}) => logger.error(msg, { ...extra, module }),
      warn: (msg, extra = {}) => logger.warn(msg, { ...extra, module }),
      info: (msg, extra = {}) => logger.info(msg, { ...extra, module }),
      debug: (msg, extra = {}) => logger.debug(msg, { ...extra, module })
    };
  }
};

export const createModuleLogger = logger.createModuleLogger;
export default logger; 