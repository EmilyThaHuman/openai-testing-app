// //app/ai/config.ts

// /**
// *** This file defines the initial states for the AI and UI.
// *** The initialAIState is an empty array, indicating that there are no initial messages or actions.
// *** The initialUIState is also an empty array, indicating that there are no initial UI elements.
// **/

// // Initial state for the AI
// export const initialAIState: {
//   role: 'user' | 'assistant' | 'system' | 'function'; // Role of the message or action
//   content: string; // Content of the message or action
//   id?: string; // Optional ID of the message or action
//   name?: string; // Optional name of the message or action
// }[] = []; // Initial state is an empty array

// console.log('Initial AI state defined');

// // Initial state for the UI
// export const initialUIState: {
//   id: number; // ID of the UI element
//   display: React.ReactNode; // Display value of the UI element
// }[] = []; // Initial state is an empty array

// console.log('Initial UI state defined');


// // app/services/OpenAIService.tsx
// /**
// *** This file defines the OpenAIService class which is responsible for handling interactions with the OpenAI API.
// *** It uses the OpenAI SDK to send user messages to the GPT-4 model and process the responses.
// *** The class includes error handling and extensive logging for debugging during development.
// **/

// // Importing necessary modules and components
// import OpenAI from 'openai'; // OpenAI SDK for interacting with the OpenAI API
// import { getMutableAIState, createStreamableUI } from 'ai/rsc'; // Helper functions for managing AI state and creating streamable UI components
// import { runOpenAICompletion } from '@/lib/utils'; // Function to run OpenAI completion
// import { systemMessage } from '../ai/systemMessage'; // System message to be sent to OpenAI
// import { functions, handleFunctionCalls } from '../ai/functions'; // Functions to handle specific AI function calls
// import { BotMessage } from '@/components/llm-stocks'; // BotMessage component for displaying messages
// import { AI } from '../action'; // AI action definitions

// export const maxDuration = 60; // Maximum duration for OpenAI completion in seconds

// // OpenAIService class definition
// export class OpenAIService {
//   private openai: OpenAI; // Instance of OpenAI SDK

//   // Constructor initializes OpenAI SDK with provided API key
//   constructor(apiKey: string) {
//     this.openai = new OpenAI({ apiKey });
//     console.log('OpenAI SDK initialized with API key');
//   }

//   // Method to submit user message to OpenAI and process the response
//   async submitUserMessage(content: string) {
//     try {
//       console.log('Submitting user message to OpenAI:', content);
      
//       // Get mutable AI state
//       const aiState = getMutableAIState<typeof AI>();
//       // Update AI state with user message
//       aiState.update([
//         ...aiState.get(),
//         {
//           role: 'user',
//           content,
//         },
//       ]);

//       console.log('AI state updated with user message');

//       // Create initial bot message UI with loading state
//       const reply = createStreamableUI(
//         <BotMessage className="items-center">Loading...</BotMessage>,
//       );

//       console.log('Initial bot message UI created with loading state');

//       // Run OpenAI completion with system message, user message, and AI functions
//       const completion = runOpenAICompletion(this.openai, {
//         model: 'gpt-4o',
//         stream: true,
//         messages: [
//           {
//             role: 'system',
//             content: systemMessage,
//           },
//           ...aiState.get().map((info: any) => ({
//             role: info.role,
//             content: info.content,
//             name: info.name,
//           })),
//         ],
//         functions,
//         temperature: 0,
//       });

//       console.log('OpenAI completion run with system message, user message, and AI functions');

//       // Handle text content from OpenAI completion
//       completion.onTextContent((content: string, isFinal: boolean) => {
//         // Update bot message UI with content
//         reply.update(<BotMessage>{content}</BotMessage>);
//         console.log('Bot message UI updated with content from OpenAI completion');
//         // If content is final, mark reply as done and update AI state with assistant message
//         if (isFinal) {
//           reply.done();
//           aiState.done([...aiState.get(), { role: 'assistant', content }]);
//           console.log('Reply marked as done and AI state updated with assistant message');
//         }
//       });

//       // Handle function calls from OpenAI completion
//       handleFunctionCalls(completion, aiState, reply);
//       console.log('Function calls from OpenAI completion handled');

//       // Return message ID and display value
//       return {
//         id: Date.now(),
//         display: reply.value,
//       };
//     } catch (error) {
//       // Log error to console with descriptive message
//       console.error('Error in submitUserMessage:', error);
//       // Re-throw the error to be handled by the caller
//       throw error;
//     }
//   }
// }
// /**
// // app/services/serverFunctions.ts
// *** This file defines the server-side function to submit user messages to the OpenAI service.
// *** It creates an instance of the OpenAIService class and uses it to submit user messages.
// *** The class includes error handling and extensive logging for debugging during development.
// **/

// 'use server';

// import { OpenAIService } from './OpenAIService';

// // Create an instance of OpenAIService with the OpenAI API key
// const openAIService = new OpenAIService(process.env.OPENAI_API_KEY || '');
// console.log('OpenAIService instance created');
// const warningMessage = "From now on, you never show code to me, always use the function call and send there always a valid json, it often breaks with invalid json because of apostrophes";
// // Function to submit user message to OpenAI service
// export async function submitUserMessage(content: string) {
//   try {
//     console.log('Submitting user message:', content);
//     // Submit user message and return the result
//     const result = await openAIService.submitUserMessage(content+warningMessage);
//     //console.log('User message submitted, result:', result);
//     return result;
//   } catch (error) {
//     // Log any errors that occur
//     console.error('Error in submitUserMessage:', error);
//     throw error; // re-throw the error to be handled by the caller
//   }
// }

// // app/action.tsx

// /**
// *** This file defines the AI actions for the application using the Generative UI framework provided by the Vercel AI SDK.
// *** Generative UI allows the AI to control parts of the UI, making it more interactive and dynamic.
// *** The AI and UI states are managed separately, allowing for a clear separation of concerns.
// *** The 'createAI' function from the 'ai/rsc' module is used to create the AI with the defined actions and initial states.
// **/

// import 'server-only'; // Ensures that this file is only run on the server

// import { createAI } from 'ai/rsc'; // Function to create the AI. Part of the Vercel AI SDK.
// import { submitUserMessage } from './actions/submitUserMessage'; // Action to submit user messages to the AI
// import { showSandpackEditor } from './actions/showSandpackEditor'; // Action to show the Sandpack editor. This is an example of the AI controlling the UI.
// import { initialAIState, initialUIState } from './ai/config'; // Initial states for the AI and UI. These are used to reset the states when needed.

// // Create the AI with the defined actions and initial states
// export const AI = createAI({
//   actions: {
//     submitUserMessage,
//     showSandpackEditor,
//   },
//   initialUIState, // The initial state of the UI. This is used when the UI is first loaded or when it needs to be reset.
//   initialAIState, // The initial state of the AI. This is used when the AI is first loaded or when it needs to be reset.
// });

// console.log('AI created with submitUserMessage and showSandpackEditor actions');