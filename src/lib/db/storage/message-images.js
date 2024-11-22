import { supabase } from '@/lib/supabase/browser-client'

/**
 * @param {string} path - Path to store the image
 * @param {File} image - Image file to upload
 * @returns {Promise<string>} File path
 */
export const uploadMessageImage = async (path, image) => {
  const bucket = 'message_images'
  const imageSizeLimit = 6000000 // 6MB

  if (image.size > imageSizeLimit) {
    throw new Error(`Image must be less than ${imageSizeLimit / 1000000}MB`)
  }

  const { error } = await supabase.storage.from(bucket).upload(path, image, {
    upsert: true
  })

  if (error) {
    throw new Error('Error uploading image')
  }

  return path
}

/**
 * @param {string} filePath - Path to the file in storage
 * @returns {Promise<string>} Signed URL
 */
export const getMessageImageFromStorage = async (filePath) => {
  const { data, error } = await supabase.storage
    .from('message_images')
    .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

  if (error) {
    throw new Error('Error downloading message image')
  }

  return data.signedUrl
} 