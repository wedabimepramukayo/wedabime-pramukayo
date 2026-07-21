/**
 * Cloudinary Upload Utility — Wedabime Pramukayo CMS
 * Handles image uploads to Cloudinary, returning URLs for lightweight DB storage
 * Only image URLs are stored in the database — no binary data
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

// Configure Cloudinary from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "wedabime-pramukayo";

export interface CloudinaryUploadResult {
  url: string;            // Full Cloudinary URL
  secureUrl: string;      // HTTPS URL
  cloudinaryId: string;   // public_id for management/deletion
  width: number;
  height: number;
  format: string;
  fileSize: number;
  mimeType: string;
  folder: string;
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer to upload
 * @param filename - Original filename for reference
 * @param mimeType - MIME type of the file
 * @param options - Additional Cloudinary upload options
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options?: Partial<UploadApiOptions>
): Promise<CloudinaryUploadResult> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop() || "jpg";
  const publicId = `${UPLOAD_FOLDER}/${timestamp}-${randomStr}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: UPLOAD_FOLDER,
        resource_type: "image",
        overwrite: false,
        // Image optimization
        quality: "auto:good",
        fetch_format: "auto",
        // Responsive breakpoints for different device sizes
        responsive_breakpoints: [
          {
            create_derived: true,
            bytes_step: 20000,
            min_width: 200,
            max_width: 1200,
            max_images: 3,
          },
        ],
        // Add context metadata
        context: {
          original_filename: filename,
        },
        // Tags for organization
        tags: [UPLOAD_FOLDER, "cms-upload"],
        ...options,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          cloudinaryId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          fileSize: result.bytes,
          mimeType: `image/${result.format}`,
          folder: result.folder || UPLOAD_FOLDER,
        });
      }
    );

    // Write buffer to the upload stream
    uploadStream.write(buffer);
    uploadStream.end();
  });
}

/**
 * Delete an image from Cloudinary by its public_id
 * @param cloudinaryId - The public_id of the image to delete
 */
export async function deleteFromCloudinary(cloudinaryId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId, {
      resource_type: "image",
      invalidate: true,
    });
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary transformation URL
 * Useful for generating thumbnails, optimized sizes, etc.
 * @param cloudinaryId - The public_id of the image
 * @param options - Transformation options
 */
export function getTransformationUrl(
  cloudinaryId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(cloudinaryId, {
    secure: true,
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || "fill",
        quality: options.quality || "auto:good",
        fetch_format: options.format || "auto",
      },
    ],
  });
}

/**
 * Get a thumbnail URL for the media manager gallery
 * Uses Cloudinary's on-the-fly transformation to generate small thumbnails
 */
export function getThumbnailUrl(cloudinaryId: string): string {
  return getTransformationUrl(cloudinaryId, {
    width: 300,
    height: 300,
    crop: "fill",
    quality: "auto:low",
  });
}

/**
 * Validate that Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export { cloudinary };
