import { supabase } from '@/lib/supabase/browser-client'
import { toast } from 'sonner'

/**
 * @param {File} file - File to upload
 * @param {Object} payload - Upload payload
 * @param {string} payload.name - File name
 * @param {string} payload.user_id - User ID
 * @param {string} payload.file_id - File ID
 * @returns {Promise<string>} File path
 */
export const uploadFile = async (file, payload) => {
  const SIZE_LIMIT = parseInt(
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || '10000000'
  )

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`
    )
  }

  const filePath = `${payload.user_id}/${Buffer.from(payload.file_id).toString('base64')}`

  const { error } = await supabase.storage
    .from('files')
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    throw new Error('Error uploading file')
  }

  return filePath
}

/**
 * @param {string} filePath - Path to the file in storage
 */
export const deleteFileFromStorage = async (filePath) => {
  const { error } = await supabase.storage.from('files').remove([filePath])

  if (error) {
    toast.error('Failed to remove file!')
    return
  }
}

/**
 * @param {string} filePath - Path to the file in storage
 * @returns {Promise<string>} Signed URL
 */
export const getFileFromStorage = async (filePath) => {
  const { data, error } = await supabase.storage
    .from('files')
    .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

  if (error) {
    console.error(`Error uploading file with path: ${filePath}`, error)
    throw new Error('Error downloading file')
  }

  return data.signedUrl
} 