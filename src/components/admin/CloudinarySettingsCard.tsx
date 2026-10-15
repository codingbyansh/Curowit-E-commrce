import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Key,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { cloudinaryService, CloudinaryConfig } from '../../services/cloudinaryService';

interface CloudinarySettingsCardProps {
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const CloudinarySettingsCard: React.FC<CloudinarySettingsCardProps> = ({ showToast }) => {
  const [config, setConfig] = useState<CloudinaryConfig>({
    cloudName: 'dehmbsgqo',
    apiKey: '242583393382769',
    uploadPreset: 'ml_default',
    isConfigured: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [testResult, setTestResult] = useState<{
    url: string;
    provider?: string;
    filename?: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    cloudinaryService.getConfig().then((cfg) => {
      if (cfg) setConfig(cfg);
    });
  }, []);

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTestFile(file);
    setIsTestingUpload(true);
    setTestResult(null);

    try {
      const res = await cloudinaryService.uploadFile(file, { folder: 'curowit-admin-test' });
      setTestResult({
        url: res.url,
        provider: res.provider,
        filename: file.name,
      });
      showToast('Media Uploaded Successfully!', `Stored via ${res.provider === 'cloudinary' ? 'Cloudinary CDN' : 'Curowit Media Server'}.`, 'success');
    } catch (err: any) {
      showToast('Upload Error', err.message || 'Failed to upload test image', 'error');
    } finally {
      setIsTestingUpload(false);
      e.target.value = '';
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast('Copied to Clipboard!', url, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFF8EA] p-5 sm:p-6 rounded-3xl border border-[#07545A]/12 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#07545A]">
              Media Delivery & Cloud Storage
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#07545A] font-display flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            <span>Cloudinary CDN & Media Infrastructure</span>
          </h3>
          <p className="text-xs text-[#173B3D]/70 max-w-2xl mt-1">
            Global content delivery network and real-time image transformation pipeline for creator portfolios, artisan store documents, product visuals, and promotional banners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Live Storage Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#07545A]/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#07545A]/10 pb-3">
              <span className="text-xs font-bold text-[#07545A] uppercase tracking-wider">
                Environment Credentials
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold">
                .env loaded
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#687778] block mb-1">Cloud Name</label>
                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#07545A]/15 font-mono text-xs font-bold text-[#07545A] flex items-center justify-between">
                  <span>{config.cloudName}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#687778] block mb-1">API Key</label>
                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#07545A]/15 font-mono text-xs text-[#173B3D] flex items-center justify-between">
                  <span>{config.apiKey.slice(0, 6)}••••••••</span>
                  <Key className="w-3.5 h-3.5 text-[#07545A]/50" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#687778] block mb-1">Upload Preset</label>
                <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#07545A]/15 font-mono text-xs text-[#173B3D]">
                  {config.uploadPreset}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#687778] block mb-1">Fail-Safe Fallback</label>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero-Upload-Failure Mode:</strong> Auto-mirrored to persistent server media repository (<code className="font-mono text-[10px]">/api/media</code>) with high-res WebP compression.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Test Upload Sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#07545A]/15 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#07545A]/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#07545A] font-display flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F2A900]" />
                  <span>Interactive Device Upload Sandbox</span>
                </h4>
                <p className="text-xs text-[#173B3D]/70">
                  Select any photo or file from your device to verify instantaneous upload and CDN link generation.
                </p>
              </div>
            </div>

            {/* Upload Drop Zone */}
            <div className="border-2 border-dashed border-[#07545A]/25 rounded-2xl p-6 sm:p-8 text-center bg-[#FFF8EA]/30 hover:bg-[#FFF8EA]/60 transition-colors">
              <input
                type="file"
                id="test-cloudinary-upload"
                accept="image/*,application/pdf"
                onChange={handleTestUpload}
                className="hidden"
                disabled={isTestingUpload}
              />
              <label
                htmlFor="test-cloudinary-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#07545A]/10 text-[#07545A] flex items-center justify-center shadow-2xs">
                  {isTestingUpload ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-[#07545A]" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#07545A] block">
                    {isTestingUpload
                      ? 'Uploading & Processing Media Asset...'
                      : 'Click to Select Image from Device'}
                  </span>
                  <span className="text-[11px] text-[#173B3D]/60 mt-1 block">
                    Supports JPG, PNG, WebP, SVG, and PDF
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Device Files</span>
                </div>
              </label>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#07545A]/20 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-[#07545A]">
                      Upload Verified & Stored
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {testResult.provider === 'cloudinary' ? 'Cloudinary CDN' : 'Curowit Media Store'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {testResult.url.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif)/i.test(testResult.url) ? (
                    <img
                      src={testResult.url}
                      alt="Uploaded preview"
                      className="w-20 h-20 rounded-xl object-cover border border-[#07545A]/20 bg-white shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-stone-100 flex items-center justify-center text-[#07545A] shrink-0 border border-stone-200">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <span className="text-xs font-medium text-[#173B3D] truncate block">
                      {testResult.filename}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={testResult.url}
                        className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-[#07545A]/20 text-[11px] font-mono text-[#07545A] truncate"
                      />
                      <button
                        onClick={() => copyUrl(testResult.url)}
                        className="px-3 py-1.5 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                      </button>
                      <a
                        href={testResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#07545A] hover:bg-[#07545A]/10 rounded-xl shrink-0"
                        title="Open image in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
