import { cloudinaryService, fileToDataUrl, compressImageForUpload } from '../services/cloudinaryService';

export function convertFileToPersistentDataUrl(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return compressImageForUpload(file);
  }
  return fileToDataUrl(file);
}

/**
 * Reusable Cloudinary file upload helper:
 * 1. Uploads directly to Cloudinary (via signed server API or direct REST)
 * 2. If Cloudinary upload is pending key configuration or offline,
 *    seamlessly preserves the file as a persistent Data URL so images,
 *    products, and portfolio proofs NEVER break or fail.
 */
export async function uploadFileWithPersistentFallback(
  file: File,
  folderPath: string
): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string; source?: string }> {
  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const cleanFolder = folderPath.replace(/[^a-zA-Z0-9/_-]/g, '_');

  try {
    const uploadRes = await cloudinaryService.uploadFile(file, {
      folder: cleanFolder,
      publicId: `${Date.now()}_${sanitized.replace(/\.[^/.]+$/, '')}`,
    });

    if (uploadRes && uploadRes.url) {
      return {
        url: uploadRes.secureUrl || uploadRes.url,
        fileName: file.name,
        fileSize: uploadRes.bytes || file.size,
        mimeType: file.type || 'application/octet-stream',
        source: uploadRes.source,
      };
    }
  } catch (err) {
    console.warn('Notice: Cloudinary upload fallback activated:', err);
  }

  // Resilient fallback (never expires, persists across browser reloads)
  const persistentUrl = await convertFileToPersistentDataUrl(file);
  return {
    url: persistentUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    source: 'fallback-data-url',
  };
}
