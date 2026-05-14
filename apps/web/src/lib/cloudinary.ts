import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export { cloudinary }

export async function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<{ cloudinary_id: string; url: string; blur_data_url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => {
          if (err || !result) return reject(err)
          const blurUrl = cloudinary.url(result.public_id, {
            width: 10,
            quality: 1,
            fetch_format: 'auto',
          })
          resolve({
            cloudinary_id: result.public_id,
            url:           result.secure_url,
            blur_data_url: blurUrl,
          })
        },
      )
      .end(buffer)
  })
}

export async function deleteImage(cloudinaryId: string): Promise<void> {
  await cloudinary.uploader.destroy(cloudinaryId)
}

/** Upload a raw file (PDF, etc.) to Cloudinary and return its ID and URL. */
export async function uploadFile(
  buffer: Buffer,
  folder: string,
  filename: string,
): Promise<{ cloudinary_id: string; url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: 'raw', public_id: filename },
        (err, result) => {
          if (err || !result) return reject(err)
          resolve({ cloudinary_id: result.public_id, url: result.secure_url })
        },
      )
      .end(buffer)
  })
}

/** Delete a raw file (PDF, etc.) from Cloudinary. */
export async function deleteFile(cloudinaryId: string): Promise<void> {
  await cloudinary.uploader.destroy(cloudinaryId, { resource_type: 'raw' })
}
