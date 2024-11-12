import winston from 'winston';
import * as Sentry from '@sentry/node';
import Transport from 'winston-transport-sentry-node';
import path from 'path';

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://bb4cd302c85175a65646b620c07b2a25@o4508287643025408.ingest.us.sentry.io/4508287654166528",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.extraErrorDataIntegration({
      depth: 3
    })
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});


// Custom format for detailed logging
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'stack']
  }),
  winston.format.json()
);

// Define log levels with custom colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: customFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
    // Sentry transport for error tracking
    new Transport({
      sentry: {
        dsn: process.env.SENTRY_DSN,
      },
      level: 'error',
      levelsMap: {
        debug: 'debug',
        info: 'info',
        warn: 'warning',
        error: 'error',
        fatal: 'fatal',
      }
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request context tracking
const addRequestContext = () => {
  const requestId = crypto.randomUUID();
  const childLogger = logger.child({ requestId });

  return {
    ...childLogger,
    error: (message, error, context = {}) => {
      Sentry.withScope(scope => {
        scope.setExtra('requestId', requestId);
        scope.setExtra('context', context);
        
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      });

      childLogger.error(message, { error, ...context });
    }
  };
};

// Create module-specific loggers
const createModuleLogger = (moduleName) => {
  const moduleLogger = logger.child({ module: moduleName });
  
  return {
    ...moduleLogger,
    error: (message, error, context = {}) => {
      Sentry.withScope(scope => {
        scope.setTag('module', moduleName);
        scope.setExtra('context', context);
        
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      });

      moduleLogger.error(message, { error, ...context });
    }
  };
};

export { logger, createModuleLogger, addRequestContext }; 