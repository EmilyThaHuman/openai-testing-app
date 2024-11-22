// // // OpenAIContext.js

// import React, { createContext, useContext, useState, useCallback } from 'react';
// import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';

// const OpenAIContext = createContext(null);

// export function OpenAIProvider({ children }) {
//   const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [error, setError] = useState(null);

//   const initialize = useCallback(async (key) => {
//     try {
//       if (!key) {
//         throw new Error('API key is required');
//       }

//       // Initialize the OpenAI service
//       UnifiedOpenAIService.initialize(key);
      
//       // Save the API key
//       localStorage.setItem('openai_api_key', key);
//       setApiKey(key);
//       setIsInitialized(true);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       setIsInitialized(false);
//       throw err;
//     }
//   }, []);

//   const clearApiKey = useCallback(() => {
//     localStorage.removeItem('openai_api_key');
//     setApiKey('');
//     setIsInitialized(false);
//   }, []);

//   const value = {
//     apiKey,
//     isInitialized,
//     error,
//     initialize,
//     clearApiKey
//   };

//   return (
//     <OpenAIContext.Provider value={value}>
//       {children}
//     </OpenAIContext.Provider>
//   );
// }

// export function useOpenAI() {
//   const context = useContext(OpenAIContext);
//   if (!context) {
//     throw new Error('useOpenAI must be used within an OpenAIProvider');
//   }
//   return context;
// }
