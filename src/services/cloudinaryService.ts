/**
 * Curowit Cloudinary & High-Fidelity Media Service
 * Provides robust media uploads with automatic fallback between:
 * 1. Cloudinary CDN (when cloud credentials & presets are active)
 * 2. Curowit Persistent Server Media Storage (/api/media)
 * 3. In-memory optimized persistent Data URLs
 */

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  isConfigured: boolean;
}

export interface UploadResult {
  url: string;
  secure_url: string;
  provider: 'cloudinary' | 'curowit_server' | 'inline';
  filename?: string;
  originalName?: string;
}

/**
 * Optimizes and compresses images using HTML5 Canvas before uploading
 * Keeps quality high while reducing payload size to ~100-300KB
 */
export async function compressImageForUpload(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, return raw Data URL
    if (!file.type.startsWith('image/')) {
      fileToDataUrl(file).then(resolve).catch(reject);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in browser'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP, fall back to JPEG
        let mime = 'image/webp';
        let dataUrl = canvas.toDataURL(mime, quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          mime = 'image/jpeg';
          dataUrl = canvas.toDataURL(mime, quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts any File (PDF, image, document) to a Data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

class CloudinaryMediaService {
  private configCache: CloudinaryConfig | null = null;

  public async getConfig(): Promise<CloudinaryConfig> {
    if (this.configCache) return this.configCache;
    try {
      const res = await fetch('/api/cloudinary/config');
      if (res.ok) {
        const data = await res.json();
        this.configCache = {
          cloudName: data.cloudName || 'dehmbsgqo',
          apiKey: data.apiKey || '242583393382769',
          uploadPreset: data.uploadPreset || 'ml_default',
          isConfigured: Boolean(data.isConfigured),
        };
        return this.configCache;
      }
    } catch {
      // ignore
    }
    return {
      cloudName: 'dehmbsgqo',
      apiKey: '242583393382769',
      uploadPreset: 'ml_default',
      isConfigured: true,
    };
  }

  /**
   * Uploads a file (File object or Data URL) through the backend media pipeline
   */
  public async uploadFile(
    file: File | string,
    options?: { folder?: string; filename?: string }
  ): Promise<UploadResult> {
    const folder = options?.folder || 'curowit';
    const originalName = typeof file === 'string' ? options?.filename || 'upload' : file.name;

    // 1. Prepare Base64 payload
    let base64Payload = '';
    if (typeof file === 'string') {
      base64Payload = file;
    } else if (file.type.startsWith('image/')) {
      base64Payload = await compressImageForUpload(file);
    } else {
      base64Payload = await fileToDataUrl(file);
    }

    // 2. Upload to backend proxy endpoint
    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Payload,
          folder,
          filename: originalName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          return {
            url: data.url,
            secure_url: data.url,
            provider: data.provider || 'curowit_server',
            filename: data.filename,
            originalName,
          };
        }
      }
    } catch (err) {
      console.warn('Backend upload endpoint notice, using local optimized payload:', err);
    }

    // 3. Resilient Fallback: return the optimized data URL so user flow NEVER breaks
    return {
      url: base64Payload,
      secure_url: base64Payload,
      provider: 'inline',
      originalName,
    };
  }

  /**
   * Generates dynamic Cloudinary transformations if the URL is on Cloudinary
   */
  public getTransformedUrl(
    url: string,
    transforms: { width?: number; height?: number; crop?: string; quality?: string } = {}
  ): string {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transformParts: string[] = [];
    if (transforms.crop) transformParts.push(`c_${transforms.crop}`);
    if (transforms.width) transformParts.push(`w_${transforms.width}`);
    if (transforms.height) transformParts.push(`h_${transforms.height}`);
    transformParts.push(transforms.quality ? `q_${transforms.quality}` : 'q_auto');
    transformParts.push('f_auto');

    return `${parts[0]}/upload/${transformParts.join(',')}/${parts[1]}`;
  }
}

export const cloudinaryService = new CloudinaryMediaService();
