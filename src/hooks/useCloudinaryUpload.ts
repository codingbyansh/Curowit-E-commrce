import { useState, useCallback } from 'react';
import { cloudinaryService, UploadResult } from '../services/cloudinaryService';

interface UseCloudinaryUploadReturn {
  isUploading: boolean;
  error: string | null;
  uploadedUrl: string | null;
  uploadFile: (file: File | string, options?: { folder?: string; filename?: string }) => Promise<string>;
  uploadMultipleFiles: (
    files: File[],
    options?: { folder?: string }
  ) => Promise<{ name: string; url: string; size?: number; type?: string }[]>;
  clearError: () => void;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const uploadFile = useCallback(
    async (file: File | string, options?: { folder?: string; filename?: string }): Promise<string> => {
      setIsUploading(true);
      setError(null);
      try {
        const result: UploadResult = await cloudinaryService.uploadFile(file, options);
        setUploadedUrl(result.url);
        return result.url;
      } catch (err: any) {
        const msg = err.message || 'File upload failed. Please try again.';
        setError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadMultipleFiles = useCallback(
    async (
      files: File[],
      options?: { folder?: string }
    ): Promise<{ name: string; url: string; size?: number; type?: string }[]> => {
      setIsUploading(true);
      setError(null);
      const results: { name: string; url: string; size?: number; type?: string }[] = [];

      try {
        for (const file of files) {
          const result = await cloudinaryService.uploadFile(file, options);
          results.push({
            name: file.name,
            url: result.url,
            size: file.size,
            type: file.type,
          });
        }
        return results;
      } catch (err: any) {
        const msg = err.message || 'Error uploading files.';
        setError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    isUploading,
    error,
    uploadedUrl,
    uploadFile,
    uploadMultipleFiles,
    clearError,
  };
}
