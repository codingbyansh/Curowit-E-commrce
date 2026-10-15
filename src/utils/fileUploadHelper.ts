import { cloudinaryService, compressImageForUpload, fileToDataUrl } from '../services/cloudinaryService';

export { compressImageForUpload, fileToDataUrl };

export async function convertFileToPersistentDataUrl(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return compressImageForUpload(file, 1600, 1600, 0.85);
  }
  return fileToDataUrl(file);
}

export async function uploadMediaFile(
  file: File,
  folder = 'curowit'
): Promise<{ url: string; success: boolean }> {
  try {
    const res = await cloudinaryService.uploadFile(file, { folder });
    return { url: res.url, success: true };
  } catch {
    const fallbackUrl = await convertFileToPersistentDataUrl(file);
    return { url: fallbackUrl, success: true };
  }
}
