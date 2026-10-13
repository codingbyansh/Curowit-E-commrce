import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { getStoredCloudinaryConfig, saveCloudinaryConfig } from '../../services/cloudinaryService';

interface CloudinarySettingsCardProps {
  onToast?: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const CloudinarySettingsCard: React.FC<CloudinarySettingsCardProps> = ({ onToast }) => {
  const { uploadFile, isUploading } = useCloudinaryUpload();
  const [config, setConfig] = useState(getStoredCloudinaryConfig());
  const [cloudName, setCloudName] = useState(config.cloudName || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [apiSecret, setApiSecret] = useState(config.apiSecret || '');
  const [uploadPreset, setUploadPreset] = useState(config.uploadPreset || 'curowit_uploads');
  const [serverStatus, setServerStatus] = useState<{
    cloudName?: string;
    hasApiKey?: boolean;
    hasApiSecret?: boolean;
    isConfigured?: boolean;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ url: string; publicId: string; source: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fetch current server-side Cloudinary config
  const refreshServerStatus = async () => {
    try {
      const res = await fetch('/api/cloudinary/config');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch server Cloudinary status', e);
    }
  };

  useEffect(() => {
    refreshServerStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = saveCloudinaryConfig({
        cloudName: cloudName.trim(),
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        uploadPreset: uploadPreset.trim(),
      });
      setConfig(updated);

      await fetch('/api/cloudinary/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudName: cloudName.trim(),
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          uploadPreset: uploadPreset.trim(),
        }),
      });

      await refreshServerStatus();
      if (onToast) {
        onToast('Cloudinary Saved', 'API credentials updated and active across portals', 'success');
      }
    } catch {
      if (onToast) {
        onToast('Save Notice', 'Credentials stored locally in session', 'success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const res = await uploadFile(file, { folder: 'curowit-tests' });
      setTestResult({
        url: res.secureUrl || res.url,
        publicId: res.publicId,
        source: res.source,
      });
      if (onToast) {
        onToast('Test Upload Succeeded', `Uploaded to ${res.source}`, 'success');
      }
    } catch (err: any) {
      if (onToast) {
        onToast('Upload Failed', err?.message || 'Check Cloudinary credentials', 'error');
      }
    }
  };

  const copyUrlToClipboard = () => {
    if (!testResult) return;
    navigator.clipboard?.writeText(testResult.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const hasCredentials = Boolean(
    (cloudName && apiKey && apiSecret) || serverStatus.hasApiSecret || uploadPreset
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#07545A]/12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-[#07545A] font-display">
                  Cloudinary Media & CDN Storage
                </h3>
                {hasCredentials ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Cloudinary Ready
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Awaiting API Key & Secret
                  </span>
                )}
              </div>
              <p className="text-xs text-[#173B3D]/70 mt-1">
                Centralized cloud media hosting for products, hero banners, artisan portfolios, and store documents.
              </p>
            </div>
          </div>

          <a
            href="https://cloudinary.com/documentation/image_upload_api_cheat_sheet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#07545A] hover:text-[#064247] flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-[#07545A]/15 shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <span>Cloudinary Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Form to enter or update credentials */}
        <form onSubmit={handleSave} className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#07545A] mb-1 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span>Cloud Name</span>
              </label>
              <input
                type="text"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="e.g. curowit-crafts"
                className="w-full px-3.5 py-2.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-medium outline-none focus:border-[#07545A]"
                required
              />
              <span className="text-[10px] text-[#173B3D]/60 mt-1 block">
                Found on your Cloudinary dashboard overview.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07545A] mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>API Key</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. 984128941294812"
                className="w-full px-3.5 py-2.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-medium outline-none focus:border-[#07545A]"
              />
              <span className="text-[10px] text-[#173B3D]/60 mt-1 block">
                API Key for authenticated server-side uploads.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07545A] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>API Secret</span>
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={serverStatus.hasApiSecret ? '•••••••••••••••• (Active)' : 'e.g. aB3_xYz98qW12...'}
                className="w-full px-3.5 py-2.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-medium outline-none focus:border-[#07545A]"
              />
              <span className="text-[10px] text-[#173B3D]/60 mt-1 block">
                Never shared publicly; signs uploads securely on server.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07545A] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Preset (Optional)</span>
              </label>
              <input
                type="text"
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                placeholder="e.g. curowit_uploads or ml_default"
                className="w-full px-3.5 py-2.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-medium outline-none focus:border-[#07545A]"
              />
              <span className="text-[10px] text-[#173B3D]/60 mt-1 block">
                For direct browser uploads if unsigned preset is enabled.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] text-amber-950 block">Cloudinary Key Permissions Note:</span>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                In your Cloudinary Console (<strong>Settings &rarr; Access Keys</strong>), verify that this API Key has the <strong>"Upload / Create"</strong> action enabled, or use the main Product Environment credentials from your Cloudinary Dashboard homepage. If using an Upload Preset, ensure it is set to <strong>Unsigned</strong> in Settings &rarr; Upload.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-[#173B3D]/70">
              Credentials are saved in <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200">.env</code> & active across server and client.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Cloudinary Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Test Upload Sandbox */}
      <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 p-6 sm:p-8 shadow-xs">
        <h4 className="text-sm font-bold text-[#07545A] uppercase tracking-wider mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#F2A900]" />
          <span>Test Upload to Cloudinary</span>
        </h4>
        <p className="text-xs text-[#173B3D]/70 mb-4">
          Select an image from your device to test real-time upload to Cloudinary.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FFFDF7] text-[#07545A] border-2 border-dashed border-[#07545A]/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-2xs">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>{isUploading ? 'Uploading to Cloudinary...' : 'Select Test Image from Device'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleTestUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {testResult && (
            <div className="flex-1 w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-200">
              <img
                src={testResult.url}
                alt="Uploaded test"
                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {testResult.source}
                  </span>
                  <span className="text-[10px] text-[#687778] truncate">
                    ID: {testResult.publicId}
                  </span>
                </div>
                <p className="text-xs text-[#07545A] font-mono truncate mt-0.5">
                  {testResult.url}
                </p>
              </div>
              <button
                type="button"
                onClick={copyUrlToClipboard}
                className="px-3 py-1.5 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-[#064247] cursor-pointer shrink-0"
              >
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
