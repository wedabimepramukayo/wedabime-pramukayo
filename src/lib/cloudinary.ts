/**
 * Cloudinary Upload Utility — Wedabime Pramukayo CMS
 * Edge-compatible: Uses fetch-based upload instead of Node.js streams
 * Works on Cloudflare Workers/Pages (V8 runtime)
 *
 * Only image URLs are stored in the database — no binary data.
 */

const CLOUD_NAME = () => process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = () => process.env.CLOUDINARY_API_KEY!;
const API_SECRET = () => process.env.CLOUDINARY_API_SECRET!;
const UPLOAD_FOLDER = () => process.env.CLOUDINARY_UPLOAD_FOLDER || "wedabime-pramukayo";

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
 * Generate Cloudinary API signature for authenticated upload
 * Uses Web Crypto API (Edge-compatible) instead of Node.js crypto
 */
async function generateSignature(paramsToSign: Record<string, string>): Promise<string> {
  // Sort parameters alphabetically and create string to sign
  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  // Append API secret
  const stringToSignWithSecret = stringToSign + API_SECRET();

  // SHA-1 hash using Web Crypto API (Edge-compatible)
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSignWithSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature;
}

/**
 * Upload a file to Cloudinary using fetch API (Edge-compatible)
 * Replaces the Node.js stream-based upload approach
 *
 * @param fileData - ArrayBuffer of the file to upload
 * @param filename - Original filename for reference
 * @param mimeType - MIME type of the file
 * @param options - Additional Cloudinary upload options
 */
export async function uploadToCloudinary(
  fileData: ArrayBuffer,
  filename: string,
  mimeType: string,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResult> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop() || "jpg";
  const folder = options?.folder || UPLOAD_FOLDER();
  const publicId = options?.publicId || `${folder}/${timestamp}-${randomStr}`;

  // Build parameters for signed upload
  const params: Record<string, string> = {
    public_id: publicId,
    folder: folder,
    resource_type: "image",
    overwrite: "false",
    timestamp: Math.floor(timestamp / 1000).toString(),
    // Image optimization
    quality: "auto:good",
    fetch_format: "auto",
    // Add context metadata
    context: `original_filename=${filename}`,
    // Tags for organization
    tags: [folder, "cms-upload", ...(options?.tags || [])].join(","),
  };

  // Generate signature
  const signature = await generateSignature(params);

  // Build FormData for upload
  const formData = new FormData();
  formData.append("file", new Blob([fileData], { type: mimeType }), filename);
  formData.append("api_key", API_KEY());
  formData.append("signature", signature);

  // Append all params
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }

  // Upload via fetch (Edge-compatible)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME()}/image/upload`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData as any).error?.message || response.statusText;
    throw new Error(`Cloudinary upload failed: ${message}`);
  }

  const result = await response.json();

  return {
    url: result.url,
    secureUrl: result.secure_url,
    cloudinaryId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    fileSize: result.bytes,
    mimeType: `image/${result.format}`,
    folder: result.folder || folder,
  };
}

/**
 * Delete an image from Cloudinary by its public_id
 * Uses signed fetch request (Edge-compatible)
 */
export async function deleteFromCloudinary(cloudinaryId: string): Promise<boolean> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params: Record<string, string> = {
      public_id: cloudinaryId,
      resource_type: "image",
      invalidate: "true",
      timestamp,
    };

    const signature = await generateSignature(params);

    const formData = new FormData();
    formData.append("public_id", cloudinaryId);
    formData.append("resource_type", "image");
    formData.append("invalidate", "true");
    formData.append("timestamp", timestamp);
    formData.append("api_key", API_KEY());
    formData.append("signature", signature);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME()}/image/destroy`;
    const response = await fetch(destroyUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Cloudinary delete failed:", response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary transformation URL
 * Useful for generating thumbnails, optimized sizes, etc.
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
  const cloudName = CLOUD_NAME();
  const transforms = [];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  transforms.push(`c_${options.crop || "fill"}`);
  transforms.push(`q_${options.quality || "auto:good"}`);
  transforms.push(`f_${options.format || "auto"}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/${cloudinaryId}`;
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
