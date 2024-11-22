import { supabase } from '@/lib/supabase/browser-client'

/**
 * @param {string} assistantId
 * @returns {Promise<Object>}
 */
export const getAssistantCollectionsByAssistantId = async (assistantId) => {
  const { data: assistantCollections, error } = await supabase
    .from('assistants')
    .select(`
      id, 
      name, 
      collections (*)
    `)
    .eq('id', assistantId)
    .single()

  if (!assistantCollections) {
    throw new Error(error.message)
  }

  return assistantCollections
}

/**
 * @param {Object} assistantCollection
 * @returns {Promise<Object>}
 */
export const createAssistantCollection = async (assistantCollection) => {
  const { data: createdAssistantCollection, error } = await supabase
    .from('assistant_collections')
    .insert(assistantCollection)
    .select('*')

  if (!createdAssistantCollection) {
    throw new Error(error.message)
  }

  return createdAssistantCollection
}

/**
 * @param {Array<Object>} assistantCollections
 * @returns {Promise<Array>}
 */
export const createAssistantCollections = async (assistantCollections) => {
  const { data: createdAssistantCollections, error } = await supabase
    .from('assistant_collections')
    .insert(assistantCollections)
    .select('*')

  if (!createdAssistantCollections) {
    throw new Error(error.message)
  }

  return createdAssistantCollections
}

/**
 * @param {string} assistantId
 * @param {string} collectionId
 * @returns {Promise<boolean>}
 */
export const deleteAssistantCollection = async (assistantId, collectionId) => {
  const { error } = await supabase
    .from('assistant_collections')
    .delete()
    .eq('assistant_id', assistantId)
    .eq('collection_id', collectionId)

  if (error) throw new Error(error.message)

  return true
} 