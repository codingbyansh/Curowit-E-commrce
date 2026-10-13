/**
 * Reusable Cloudinary Media & File Upload Service for Curowit
 * Handles image & asset uploads for Creator and Admin CMS portals,
 * providing direct REST uploads, signed server uploads, transformations,
 * and seamless fallback handling.
 */

export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  folder?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: string;
  publicId?: string;
  onProgress?: (progress: number) => void;
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  originalName?: string;
  source: 'cloudinary-signed' | 'cloudinary-unsigned' | 'cloudinary-server' | 'fallback-data-url';
}

const STORAGE_KEY = 'curowit_cloudinary_config_v1';

// Default configuration with environment fallbacks
export function getStoredCloudinaryConfig(): CloudinaryConfig {
  let stored: Partial<CloudinaryConfig> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse stored Cloudinary config', e);
    }
  }

  // Vite client env variables or defaults
  const envCloudName = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || '';
  const envApiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_API_KEY) || '';
  const envPreset = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || 'curowit_uploads';

  return {
    cloudName: stored.cloudName || envCloudName || 'dehmbsgqo',
    apiKey: stored.apiKey || envApiKey || '242583393382769',
    apiSecret: stored.apiSecret || 'fWp-RcWGOCpO9sZY3MEvu43Pi3Q',
    uploadPreset: stored.uploadPreset || envPreset || 'ml_default',
    folder: stored.folder || 'curowit',
  };
}

export function saveCloudinaryConfig(config: Partial<CloudinaryConfig>): CloudinaryConfig {
  const current = getStoredCloudinaryConfig();
  const updated: CloudinaryConfig = {
    ...current,
    ...config,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save Cloudinary config to localStorage', e);
    }
  }

  // Also sync credentials to backend server if available
  if (typeof fetch !== 'undefined') {
    fetch('/api/cloudinary/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cloudName: updated.cloudName,
        apiKey: updated.apiKey,
        apiSecret: updated.apiSecret,
        uploadPreset: updated.uploadPreset,
      }),
    }).catch(() => {
      // Ignore background sync errors
    });
  }

  return updated;
}

/**
 * Converts a File or Blob into a Base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file into data URL'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image on canvas to prevent excessively large payload transfers
 */
export function compressImageForUpload(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      fileToDataUrl(file).then(resolve);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

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
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Primary Cloudinary upload method:
 * 1. Checks if server-side signed proxy `/api/cloudinary/upload` is available
 * 2. Attempts direct client upload to Cloudinary API with preset or signature
 * 3. Gracefully falls back to high-res local persistent Data URL so user workflows never break
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const config = getStoredCloudinaryConfig();
  const folder = options.folder || config.folder || 'curowit';
  const fileName = file instanceof File ? file.name : `file_${Date.now()}`;
  const fileSize = file instanceof File ? file.size : 0;

  // Step 1: Convert file to string / base64 if needed
  let base64Payload: string;
  if (typeof file === 'string') {
    base64Payload = file;
  } else if (file instanceof File && file.type.startsWith('image/')) {
    base64Payload = await compressImageForUpload(file);
  } else {
    base64Payload = await fileToDataUrl(file);
  }

  // Step 2: Try Server-Side Cloudinary Upload endpoint (/api/cloudinary/upload)
  try {
    const serverResponse = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Payload,
        folder,
        tags: options.tags || ['curowit', folder],
        publicId: options.publicId,
        fileName,
        cloudName: config.cloudName,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        uploadPreset: config.uploadPreset,
      }),
    });

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      if (data && (data.secureUrl || data.url)) {
        const finalUrl = data.secureUrl || data.url;
        return {
          url: finalUrl,
          secureUrl: finalUrl,
          publicId: data.publicId || data.public_id || `curowit_${Date.now()}`,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes || fileSize,
          originalName: fileName,
          source: 'cloudinary-server',
        };
      }
    }
  } catch (serverErr) {
    console.warn('Server Cloudinary endpoint notice:', serverErr);
  }

  // Step 3: Try Direct Cloudinary REST API upload if Cloud Name is configured
  if (config.cloudName && config.cloudName !== 'curowit-media') {
    try {
      const formData = new FormData();
      formData.append('file', base64Payload);
      if (config.uploadPreset) {
        formData.append('upload_preset', config.uploadPreset);
      }
      formData.append('folder', folder);
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      const directRes = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (directRes.ok) {
        const directData = await directRes.json();
        const secureUrl = directData.secure_url || directData.url;
        return {
          url: secureUrl,
          secureUrl,
          publicId: directData.public_id,
          format: directData.format,
          width: directData.width,
          height: directData.height,
          bytes: directData.bytes,
          originalName: fileName,
          source: 'cloudinary-unsigned',
        };
      }
    } catch (directErr) {
      console.warn('Direct Cloudinary REST upload error:', directErr);
    }
  }

  // Step 4: Resilient Persistent Data URL fallback
  // Ensures that images uploaded in Creator and Admin CMS still work seamlessly
  // even if Cloudinary credentials haven't been entered by the user yet.
  return {
    url: base64Payload,
    secureUrl: base64Payload,
    publicId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bytes: fileSize || base64Payload.length,
    originalName: fileName,
    source: 'fallback-data-url',
  };
}

/**
 * Builds an optimized Cloudinary delivery URL with dynamic responsive transformations
 */
export function getOptimizedCloudinaryUrl(
  urlOrPublicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb' | 'scale';
    quality?: 'auto' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!urlOrPublicId) return '';

  // If not a Cloudinary URL or already a base64 / blob / non-cloudinary url, return directly
  if (!urlOrPublicId.includes('res.cloudinary.com')) {
    return urlOrPublicId;
  }

  const parts = urlOrPublicId.split('/upload/');
  if (parts.length !== 2) return urlOrPublicId;

  const transforms: string[] = [];
  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  transforms.push(`q_${transformations.quality || 'auto'}`);
  transforms.push(`f_${transformations.format || 'auto'}`);

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
}

export const cloudinaryService = {
  getConfig: getStoredCloudinaryConfig,
  saveConfig: saveCloudinaryConfig,
  uploadFile: uploadToCloudinary,
  compressImage: compressImageForUpload,
  getOptimizedUrl: getOptimizedCloudinaryUrl,
};
