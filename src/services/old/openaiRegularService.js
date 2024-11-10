import OpenAI from 'openai';

let openai = null;

export function setApiKey(apiKey) {
  openai = new OpenAI({ apiKey });
}

export async function createCompletion(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.completions.create(params);
}

export async function createEdit(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.edits.create(params);
}

export async function createEmbedding(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.embeddings.create(params);
}

export async function createImage(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.images.generate(params);
}

export async function createImageEdit(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.images.edit(params);
}

export async function createImageVariation(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.images.createVariation(params);
}

export async function createAudioTranscription(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.audio.transcriptions.create(params);
}

export async function createAudioTranslation(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.audio.translations.create(params);
}

export async function createModeration(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.moderations.create(params);
}

export async function listFiles() {
  if (!openai) throw new Error('API key not set');
  return await openai.files.list();
}

export async function uploadFile(file) {
  if (!openai) throw new Error('API key not set');
  return await openai.files.create({ file, purpose: 'fine-tune' });
}

export async function deleteFile(fileId) {
  if (!openai) throw new Error('API key not set');
  return await openai.files.del(fileId);
}

export async function retrieveFile(fileId) {
  if (!openai) throw new Error('API key not set');
  return await openai.files.retrieve(fileId);
}

export async function createFineTune(params) {
  if (!openai) throw new Error('API key not set');
  return await openai.fineTuning.jobs.create(params);
}

export async function listFineTunes() {
  if (!openai) throw new Error('API key not set');
  return await openai.fineTuning.jobs.list();
}

export async function retrieveFineTune(fineTuneId) {
  if (!openai) throw new Error('API key not set');
  return await openai.fineTuning.jobs.retrieve(fineTuneId);
}

export async function cancelFineTune(fineTuneId) {
  if (!openai) throw new Error('API key not set');
  return await openai.fineTuning.jobs.cancel(fineTuneId);
}

export async function deleteFineTuneModel(model) {
  if (!openai) throw new Error('API key not set');
  return await openai.models.del(model);
} 