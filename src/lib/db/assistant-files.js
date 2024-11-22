import { supabase } from '@/lib/supabase/browser-client'

/**
 * @param {string} assistantId
 * @returns {Promise<Object>}
 */
export const getAssistantFilesByAssistantId = async (assistantId) => {
  const { data: assistantFiles, error } = await supabase
    .from('assistants')
    .select(`
      id, 
      name, 
      files (*)
    `)
    .eq('id', assistantId)
    .single()

  if (!assistantFiles) {
    throw new Error(error.message)
  }

  return assistantFiles
}

/**
 * @param {Object} assistantFile
 * @returns {Promise<Object>}
 */
export const createAssistantFile = async (assistantFile) => {
  const { data: createdAssistantFile, error } = await supabase
    .from('assistant_files')
    .insert(assistantFile)
    .select('*')

  if (!createdAssistantFile) {
    throw new Error(error.message)
  }

  return createdAssistantFile
}

/**
 * @param {Array<Object>} assistantFiles
 * @returns {Promise<Array>}
 */
export const createAssistantFiles = async (assistantFiles) => {
  const { data: createdAssistantFiles, error } = await supabase
    .from('assistant_files')
    .insert(assistantFiles)
    .select('*')

  if (!createdAssistantFiles) {
    throw new Error(error.message)
  }

  return createdAssistantFiles
}

/**
 * @param {string} assistantId
 * @param {string} fileId
 * @returns {Promise<boolean>}
 */
export const deleteAssistantFile = async (assistantId, fileId) => {
  const { error } = await supabase
    .from('assistant_files')
    .delete()
    .eq('assistant_id', assistantId)
    .eq('file_id', fileId)

  if (error) throw new Error(error.message)

  return true
} 