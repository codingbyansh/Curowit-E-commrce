import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileQuestion,
  XCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import { foundingCreatorSyncService } from '../../lib/foundingCreatorSync';
import { CreatorApplication, CreatorProfile } from '../../types/foundingCreator';

interface FoundingCreatorStatusProps {
  onNavigate: (view: string) => void;
  initialId?: string;
}

export const FoundingCreatorStatus: React.FC<FoundingCreatorStatusProps> = ({
  onNavigate,
  initialId,
}) => {
  const [query, setQuery] = useState(initialId || '');
  const [result, setResult] = useState<{
    application: CreatorApplication | null;
    creator: CreatorProfile | null;
  } | null>(null);
  const [searched, setSearched] = useState(false);
  const [submittedAdditionalInfo, setSubmittedAdditionalInfo] = useState('');
  const [infoSubmittedSuccess, setInfoSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    try {
      const app = await foundingCreatorService.fetchCreatorApplicationAsync(searchTerm.trim());
      if (app) {
        const profs = foundingCreatorService.getAllProfiles();
        const creator = profs.find((p) => p.id === app.creatorId || p.email?.toLowerCase() === app.applicantEmail?.toLowerCase()) || null;
        setResult({ application: app, creator });
      } else {
        const res = foundingCreatorService.getApplicationByIdOrEmail(searchTerm.trim());
        setResult(res);
      }
    } catch {
      const res = foundingCreatorService.getApplicationByIdOrEmail(searchTerm.trim());
      setResult(res);
    }
    setSearched(true);
  };

  const handleSubmitAdditionalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?.application || !submittedAdditionalInfo.trim()) return;

    const apps = foundingCreatorService.getAllApplications();
    const idx = apps.findIndex((a) => a.id === result.application!.id);
    if (idx !== -1) {
      apps[idx].applicationStatus = 'under_review';
      apps[idx].reviewNotes = `Additional info provided by applicant: ${submittedAdditionalInfo.trim()}`;
      apps[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('curowit_fc_applications_v1', JSON.stringify(apps));

      // Sync to backend
      fetch('/api/founding-creator/review-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: apps[idx].applicationId,
          action: 'request_info',
          notes: apps[idx].reviewNotes,
        }),
      }).catch(() => {});

      setResult({
        ...result,
        application: apps[idx],
      });
      setInfoSubmittedSuccess(true);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          title: 'Application Approved & Verified',
          desc: 'Congratulations! Your artisan studio has been accepted into the Curowit Founding Creator cohort. You can now log in to access your dashboard.',
        };
      case 'under_review':
        return {
          icon: Clock,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          title: 'Under Curation Review',
          desc: 'Our lead curators are currently reviewing your craft portfolio and product specifications. Expected turnaround: 24–48 hours.',
        };
      case 'additional_info_required':
        return {
          icon: FileQuestion,
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          title: 'Additional Information Requested',
          desc: 'Our curation team has requested additional details before finalizing approval. Please provide the details below.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          title: 'Application Not Accepted at this Time',
          desc: 'Thank you for your interest. Unfortunately, your submission does not currently meet our slow-craft and handmade criteria.',
        };
      case 'pending_review':
      default:
        return {
          icon: Clock,
          color: 'text-[#07545A] bg-[#FFF8EA] border-[#07545A]/20',
          title: 'Pending Review in Curation Queue',
          desc: 'Your application has been received and is queued for evaluation. You will receive an email update once reviewed.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#192B2C] py-8 sm:py-12 px-4 relative overflow-hidden">
      {/* Radiant Warm Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-40 z-0 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245, 158, 11, 0.12), rgba(7, 84, 90, 0.08) 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle blueprint guidelines */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-20 select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="90%" cy="15%" r="160" fill="none" stroke="#07545A" strokeWidth="0.8" strokeDasharray="3 6" />
        <circle cx="10%" cy="80%" r="180" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="5 7" />
      </svg>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('foundingcreator')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07474C] hover:text-[#B45309] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creator Program</span>
          </button>

          <button
            onClick={() => onNavigate('foundingcreator-apply')}
            className="text-xs font-medium text-[#233837]/75 hover:text-[#07474C]"
          >
            Not applied yet? <span className="underline font-semibold">Apply here</span>
          </button>
        </div>

        {/* Card Header */}
        <div className="bg-white/95 rounded-3xl border border-[#07545A]/14 p-6 sm:p-8 shadow-[0_8px_24px_-4px_rgba(7,84,90,0.06)] space-y-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3 py-1 rounded-full inline-block font-sans">
              Real-Time Verification
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#07474C] font-display mt-2 tracking-tight">
              Track Founding Creator Application
            </h1>
            <p className="text-xs text-[#233837]/75 mt-1 font-normal">
              Enter your Application ID (e.g. <code>APP-FC-98421</code>) or your registered email address to check status.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233837]/45" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="APP-FC-XXXXX or your email..."
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A]/20 transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0 active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          {/* Search guidance note */}
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#233837]/65 flex-wrap">
            <span className="font-semibold text-[#07474C]">Lookup tip:</span>
            <span>Enter your 9-digit application reference code or registered email address.</span>
          </div>
        </div>

        {/* Search Results */}
        {searched && (
          <div>
            {!result?.application ? (
              <div className="bg-white/95 rounded-3xl border border-dashed border-[#07545A]/25 p-8 text-center space-y-3 shadow-2xs">
                <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="font-semibold text-[#07474C] text-sm">No Application Found</h3>
                <p className="text-xs text-[#233837]/75 max-w-sm mx-auto">
                  We could not find an application matching "{query}". Please check the ID or email address, or submit a new application.
                </p>
                <button
                  onClick={() => onNavigate('foundingcreator-apply')}
                  className="px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Start New Application
                </button>
              </div>
            ) : (
              <div className="bg-white/95 rounded-3xl border border-[#07545A]/14 overflow-hidden shadow-[0_8px_24px_-4px_rgba(7,84,90,0.06)] space-y-6 p-6 sm:p-8 animate-in fade-in-50 duration-200">
                {/* Status Hero Card */}
                {(() => {
                  const statusInfo = getStatusDisplay(result.application.applicationStatus);
                  const Icon = statusInfo.icon;
                  return (
                    <div className={`p-5 rounded-2xl border ${statusInfo.color} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 shrink-0" />
                          <h3 className="font-bold text-sm">{statusInfo.title}</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                          {result.application.applicationStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{statusInfo.desc}</p>
                    </div>
                  );
                })()}

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs bg-[#FFF8EA]/50 p-4 rounded-2xl border border-[#07545A]/10">
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Application ID</span>
                    <span className="font-mono font-bold text-[#07545A]">{result.application.applicationId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Applicant</span>
                    <span className="font-semibold text-[#173B3D]">{result.application.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Studio Location</span>
                    <span className="font-semibold text-[#173B3D]">{result.application.city}, {result.application.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Categories</span>
                    <span className="font-semibold text-[#173B3D]">{result.application.categories.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Submission Date</span>
                    <span className="font-semibold text-[#173B3D]">
                      {new Date(result.application.submittedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#687778] uppercase block">Reviewer</span>
                    <span className="font-semibold text-[#173B3D]">
                      {result.application.reviewedBy || 'Pending Assignment'}
                    </span>
                  </div>
                </div>

                {/* Curation Notes if present */}
                {result.application.reviewNotes && (
                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#07545A]/15 text-xs space-y-1">
                    <span className="font-bold text-[#07545A] block">Curation Team Notes:</span>
                    <p className="text-[#173B3D]/80 italic">{result.application.reviewNotes}</p>
                  </div>
                )}

                {/* If Additional Info Required: Response form */}
                {result.application.applicationStatus === 'additional_info_required' && (
                  <div className="border border-amber-300 bg-amber-50/50 p-5 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 text-amber-700" />
                        <span>Action Required: Provide Information</span>
                      </h4>
                      <p className="text-[11px] text-amber-900/80">
                        {result.application.requestedInfo || 'Please provide details requested by our review team.'}
                      </p>
                    </div>

                    {infoSubmittedSuccess ? (
                      <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Your response has been submitted and your application is back under review.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAdditionalInfo} className="space-y-2">
                        <textarea
                          rows={3}
                          required
                          value={submittedAdditionalInfo}
                          onChange={(e) => setSubmittedAdditionalInfo(e.target.value)}
                          placeholder="Type your response or studio clarifications here..."
                          className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs outline-none focus:border-amber-600"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Details</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Action button based on status */}
                <div className="pt-4 border-t border-[#07545A]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {result.application.applicationStatus === 'approved' ? (
                    <button
                      onClick={() => onNavigate('foundingcreator-login')}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Log In to Creator Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#687778]">
                      Questions? Contact creator support at <strong>atelier@curowit.com</strong>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearched(false);
                      setQuery('');
                    }}
                    className="text-xs font-semibold text-[#07545A] hover:underline cursor-pointer"
                  >
                    Look up another application
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
