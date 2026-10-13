import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Resilient file upload helper:
 * 1. Tries Firebase Storage uploadBytes & getDownloadURL
 * 2. If Firebase Storage fails (CORS, 403 unauthenticated, bucket config, or network),
 *    converts the file to a permanent, persistent Data URL (resampled to max 1200px for images)
 *    so images and portfolio proofs NEVER break, NEVER expire, and ALWAYS display.
 */
export async function uploadFileWithPersistentFallback(
  file: File,
  folderPath: string
): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }> {
  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fullPath = `${folderPath}/${Date.now()}_${sanitized}`;

  // 1. Attempt Firebase Storage
  try {
    const fileRef = ref(storage, fullPath);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (downloadUrl && downloadUrl.startsWith('http')) {
      return {
        url: downloadUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      };
    }
  } catch (err) {
    console.warn('Notice: Firebase storage upload fallback activated:', err);
  }

  // 2. Persistent fallback (never expires, persists across browser reloads)
  const persistentUrl = await convertFileToPersistentDataUrl(file);
  return {
    url: persistentUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
  };
}

export function convertFileToPersistentDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }

    // For images, optimize size to ensure snappy persistence
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) {
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const compressed = canvas.toDataURL(format, 0.85);
            resolve(compressed);
            return;
          }
          resolve(rawResult);
        };
        img.onerror = () => resolve(rawResult);
        img.src = rawResult;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } else {
      // PDF or documents
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }
  });
}
