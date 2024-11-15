import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Ensure this path is correct
import App from './App';

// ========================================================
// [index] | This is the entry point for the application
// =========================================================

const reportRecoverableError = ({ error, cause, componentStack }) => {
  console.error('Recoverable Error:', error);
  console.error('Error Cause:', cause);
  console.error('Component Stack:', componentStack);
};

const container = document.getElementById('root');
const root = createRoot(container, {
  onRecoverableError: (error, errorInfo) => {
    console.error('Error:', error);
    if (errorInfo?.componentStack) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    reportRecoverableError({
      error,
      cause: error.cause,
      componentStack: errorInfo.componentStack,
    });
  },
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
