import { useState, useCallback } from 'react';
import {
  cloudinaryService,
  CloudinaryConfig,
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
  getStoredCloudinaryConfig,
  saveCloudinaryConfig,
} from '../services/cloudinaryService';

export interface UseCloudinaryUploadReturn {
  uploadFile: (
    file: File | Blob | string,
    options?: CloudinaryUploadOptions
  ) => Promise<CloudinaryUploadResult>;
  uploadMultiple: (
    files: (File | Blob)[],
    options?: CloudinaryUploadOptions
  ) => Promise<CloudinaryUploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  lastResult: CloudinaryUploadResult | null;
  reset: () => void;
  config: CloudinaryConfig;
  updateConfig: (newConfig: Partial<CloudinaryConfig>) => void;
  isConfigured: boolean;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CloudinaryUploadResult | null>(null);
  const [config, setConfig] = useState<CloudinaryConfig>(getStoredCloudinaryConfig());

  const updateConfig = useCallback((newConfig: Partial<CloudinaryConfig>) => {
    const updated = saveCloudinaryConfig(newConfig);
    setConfig(updated);
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setLastResult(null);
  }, []);

  const uploadFile = useCallback(
    async (
      file: File | Blob | string,
      options: CloudinaryUploadOptions = {}
    ): Promise<CloudinaryUploadResult> => {
      setIsUploading(true);
      setProgress(15);
      setError(null);

      try {
        setProgress(45);
        const result = await cloudinaryService.uploadFile(file, {
          ...options,
          onProgress: (p) => setProgress(p),
        });

        setProgress(100);
        setLastResult(result);
        return result;
      } catch (err: any) {
        const message = err?.message || 'Failed to upload image to Cloudinary';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (
      files: (File | Blob)[],
      options: CloudinaryUploadOptions = {}
    ): Promise<CloudinaryUploadResult[]> => {
      setIsUploading(true);
      setProgress(10);
      setError(null);

      const results: CloudinaryUploadResult[] = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await cloudinaryService.uploadFile(file, options);
          results.push(result);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (results.length > 0) {
          setLastResult(results[results.length - 1]);
        }
        return results;
      } catch (err: any) {
        const message = err?.message || 'Failed to upload files';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const isConfigured = Boolean(
    config.cloudName &&
      config.cloudName !== 'curowit-media' &&
      ((config.apiKey && config.apiSecret) || config.uploadPreset)
  );

  return {
    uploadFile,
    uploadMultiple,
    isUploading,
    progress,
    error,
    lastResult,
    reset,
    config,
    updateConfig,
    isConfigured,
  };
}
