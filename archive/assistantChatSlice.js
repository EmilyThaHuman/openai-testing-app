// import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
// import { produce } from "immer";
// import { v4 as uuidv4 } from 'uuid';

// export const createAssistantChatSlice = (set, get) => ({
//   assistantChats: [],
//   activeAssistantChat: null,
//   threads: {},
//   runningThreads: new Set(),

//   // Assistant chat management
//   setActiveAssistantChat: (chatId) =>
//     set(produce((state) => {
//       state.activeAssistantChat = state.assistantChats.find(
//         (chat) => chat.id === chatId
//       ) || null;
//     })),

//   createAssistantChat: (assistantId) => {
//     const assistant = get().assistants.find(a => a.id === assistantId);
//     if (!assistant) return null;

//     const newChat = {
//       id: uuidv4(),
//       type: 'assistant',
//       assistantId,
//       assistantName: assistant.name,
//       threadId: null,
//       messages: [],
//       createdAt: new Date().toISOString(),
//       settings: { ...assistant.settings }
//     };
    
//     set(produce((state) => {
//       state.assistantChats.unshift(newChat);
//       state.activeAssistantChat = newChat;
//     }));
    
//     return newChat;
//   },

//   // Thread management
//   createThread: async (chatId) => {
//     const state = get();
//     const chat = state.assistantChats.find(c => c.id === chatId);
    
//     if (!chat) return;

//     try {
//       const thread = await UnifiedOpenAIService.threads.create();
      
//       set(produce((state) => {
//         const chat = state.assistantChats.find(c => c.id === chatId);
//         if (chat) {
//           chat.threadId = thread.id;
//         }
//         state.threads[thread.id] = thread;
//       }));
      
//       return thread;
//     } catch (error) {
//       state.setError(error.message);
//     }
//   },

//   // Message handling for assistant chats
//   sendAssistantMessage: async (chatId, content) => {
//     const state = get();
//     const chat = state.assistantChats.find(c => c.id === chatId);
    
//     if (!chat) return;

//     try {
//       // Create thread if it doesn't exist
//       if (!chat.threadId) {
//         await state.createThread(chatId);
//       }

//       // Add message to thread
//       const message = await UnifiedOpenAIService.threads.messages.create(
//         chat.threadId,
//         { role: 'user', content }
//       );

//       // Add message to local state
//       state.addAssistantMessage(chatId, {
//         id: message.id,
//         role: 'user',
//         content,
//         timestamp: new Date().toISOString()
//       });

//       // Create and run assistant
//       const run = await UnifiedOpenAIService.threads.runs.create(
//         chat.threadId,
//         { assistant_id: chat.assistantId }
//       );

//       // Track running thread
//       set(produce((state) => {
//         state.runningThreads.add(chat.threadId);
//       }));

//       // Poll for completion
//       await state.pollRunCompletion(chat.threadId, run.id);

//       // Get assistant response
//       const messages = await UnifiedOpenAIService.threads.messages.list(
//         chat.threadId
//       );

//       // Add assistant response to local state
//       const assistantMessage = messages.data[0];
//       state.addAssistantMessage(chatId, {
//         id: assistantMessage.id,
//         role: 'assistant',
//         content: assistantMessage.content[0].text.value,
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       state.setError(error.message);
//     } finally {
//       set(produce((state) => {
//         state.runningThreads.delete(chat.threadId);
//       }));
//     }
//   },

//   // Helper methods
//   pollRunCompletion: async (threadId, runId) => {
//     const maxAttempts = 30;
//     let attempts = 0;

//     while (attempts < maxAttempts) {
//       const run = await UnifiedOpenAIService.threads.runs.retrieve(
//         threadId,
//         runId
//       );

//       if (run.status === 'completed') {
//         return run;
//       }

//       if (['failed', 'cancelled', 'expired'].includes(run.status)) {
//         throw new Error(`Run ${runId} ${run.status}`);
//       }

//       await new Promise(resolve => setTimeout(resolve, 1000));
//       attempts++;
//     }

//     throw new Error('Run timed out');
//   },

//   addAssistantMessage: (chatId, message) =>
//     set(produce((state) => {
//       const chat = state.assistantChats.find((c) => c.id === chatId);
//       if (chat) {
//         if (!chat.messages) chat.messages = [];
//         chat.messages.push(message);
//         chat.lastMessage = message.content;
//         chat.lastMessageAt = new Date().toISOString();
//       }
//     })),

//   deleteAssistantChat: (chatId) =>
//     set(produce((state) => {
//       state.assistantChats = state.assistantChats.filter(c => c.id !== chatId);
//       if (state.activeAssistantChat?.id === chatId) {
//         state.activeAssistantChat = state.assistantChats[0] || null;
//       }
//     })),

//   clearAssistantChat: (chatId) =>
//     set(produce((state) => {
//       const chat = state.assistantChats.find(c => c.id === chatId);
//       if (chat) {
//         chat.messages = [];
//         chat.threadId = null;
//       }
//     })),
// }); 