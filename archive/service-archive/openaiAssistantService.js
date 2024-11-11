import OpenAI from 'openai';

let openai = null;

export function setApiKey(apiKey) {
  openai = new OpenAI({ apiKey });
}

export async function createAssistant(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.assistants.create(params);
}

export async function listAssistants(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.assistants.list(params);
}

export async function retrieveAssistant(assistantId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.assistants.retrieve(assistantId);
}

export async function modifyAssistant(assistantId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.assistants.update(assistantId, params);
}

export async function deleteAssistant(assistantId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.assistants.del(assistantId);
}

export async function createThread() {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.create();
}

export async function retrieveThread(threadId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.retrieve(threadId);
}

export async function modifyThread(threadId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.update(threadId, params);
}

export async function deleteThread(threadId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.del(threadId);
}

export async function createMessage(threadId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.messages.create(threadId, params);
}

export async function listMessages(threadId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.messages.list(threadId, params);
}

export async function retrieveMessage(threadId, messageId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.messages.retrieve(threadId, messageId);
}

export async function modifyMessage(threadId, messageId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.messages.update(threadId, messageId, params);
}

export async function createRun(threadId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.create(threadId, params);
}

export async function listRuns(threadId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.list(threadId, params);
}

export async function retrieveRun(threadId, runId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.retrieve(threadId, runId);
}

export async function modifyRun(threadId, runId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.update(threadId, runId, params);
}

export async function submitToolOutputs(threadId, runId, params) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.submitToolOutputs(threadId, runId, params);
}

export async function cancelRun(threadId, runId) {
  if (!openai) throw new Error('API key not set');
  return await openai.beta.threads.runs.cancel(threadId, runId);
} 