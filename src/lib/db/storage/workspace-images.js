import { supabase } from '@/lib/supabase/browser-client'

/**
 * @param {Object} workspace - Workspace object
 * @param {File} image - Image file to upload
 * @returns {Promise<string>} File path
 */
export const uploadWorkspaceImage = async (workspace, image) => {
  const bucket = 'workspace_images'
  const imageSizeLimit = 6000000 // 6MB

  if (image.size > imageSizeLimit) {
    throw new Error(`Image must be less than ${imageSizeLimit / 1000000}MB`)
  }

  const currentPath = workspace.image_path
  const filePath = `${workspace.user_id}/${workspace.id}/${Date.now()}`

  if (currentPath.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([currentPath])

    if (deleteError) {
      throw new Error('Error deleting old image')
    }
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, image, {
      upsert: true
    })

  if (error) {
    throw new Error('Error uploading image')
  }

  return filePath
}

/**
 * @param {string} filePath - Path to the file in storage
 * @returns {Promise<string>} Signed URL
 */
export const getWorkspaceImageFromStorage = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('workspace_images')
      .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

    if (error) {
      throw new Error('Error downloading workspace image')
    }

    return data.signedUrl
  } catch (error) {
    console.error(error)
  }
} 