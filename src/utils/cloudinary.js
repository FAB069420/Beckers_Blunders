/**
 * Cloudinary Upload Utility
 *
 * This uses Cloudinary's unsigned upload preset for easy image hosting.
 *
 * Setup Instructions:
 * 1. Go to cloudinary.com and create a free account
 * 2. Go to Settings → Upload → Add upload preset
 * 3. Set "Signing Mode" to "Unsigned"
 * 4. Name it something like "crypto-predictions"
 * 5. Save and copy the preset name
 * 6. Update the constants below with your cloud name and preset
 */

// Get credentials from environment variables (.env.local file)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME'
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadToCloudinary(file, onProgress = null) {
  // Validate cloud name is configured
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    throw new Error(
      'Cloudinary not configured! Please update cloudinary.js with your credentials.\n\n' +
      'See src/utils/cloudinary.js for setup instructions.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'crypto-predictions') // Organize uploads in a folder

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Upload failed')
    }

    const data = await response.json()

    // Return the secure URL (https)
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

/**
 * Compress and upload an image
 * @param {File} file - The image file
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - URL of uploaded image
 */
export async function compressAndUpload(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth
            width = maxWidth
          } else {
            width = (width / height) * maxHeight
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          async (blob) => {
            try {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })

              const url = await uploadToCloudinary(compressedFile)
              resolve(url)
            } catch (error) {
              reject(error)
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
         CLOUDINARY_UPLOAD_PRESET !== 'YOUR_UPLOAD_PRESET'
}
