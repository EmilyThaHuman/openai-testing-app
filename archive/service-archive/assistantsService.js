const OPENAI_API_BASE_URL = 'https://api.openai.com/v1'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${OPENAI_API_BASE_URL}${endpoint}`
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v1'
  }

  const options = {
    method,
    headers
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

export async function createAssistant(data) {
  return apiRequest('/assistants', 'POST', data)
}

export async function listAssistants() {
  return apiRequest('/assistants')
}

export async function getAssistant(assistantId) {
  return apiRequest(`/assistants/${assistantId}`)
}

export async function createThread(data) {
  return apiRequest('/threads', 'POST', data)
}

export async function listThreadMessages(threadId) {
  return apiRequest(`/threads/${threadId}/messages`)
}

export async function createMessage(threadId, data) {
  return apiRequest(`/threads/${threadId}/messages`, 'POST', data)
}

export async function createRun(threadId, data) {
  return apiRequest(`/threads/${threadId}/runs`, 'POST', data)
}

export async function getRun(threadId, runId) {
  return apiRequest(`/threads/${threadId}/runs/${runId}`)
} 