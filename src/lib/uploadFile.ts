import { supabase } from '@/lib/supabaseClient'

export interface UploadResult {
  publicUrl: string
  storagePath: string
}

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string,
  retries: number = 3
): Promise<UploadResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Generate a unique filename with timestamp
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}-${randomId}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log(`Uploading file to ${bucket}/${filePath} (attempt ${attempt}/${retries})`)

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error(`Upload error (attempt ${attempt}):`, uploadError)
        
        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw new Error(`Failed to upload file after ${retries} attempts: ${uploadError.message}`)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      console.log(`File uploaded successfully: ${publicUrl}`)

      return {
        publicUrl,
        storagePath: filePath
      }
    } catch (error) {
      console.error(`Error in uploadFile (attempt ${attempt}):`, error)
      
      // If it's the last attempt, throw the error
      if (attempt === retries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  
  throw new Error(`Failed to upload file after ${retries} attempts`)
} 