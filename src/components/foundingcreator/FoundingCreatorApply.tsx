import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  Trash2,
  ShieldCheck,
  FileText,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import { syncEventBus } from '../../lib/foundingCreatorSync';
import { CreatorType } from '../../types/foundingCreator';

interface FoundingCreatorApplyProps {
  onNavigate: (view: string) => void;
}

const CATEGORIES_LIST = [
  'Handmade jewellery',
  'Crochet & yarn crafts',
  'Keychains & charms',
  'Bags & accessories',
  'Paintings & artwork',
  'Candles & home decor',
  'Personalized gifts',
  'DIY kits & creative supplies',
  'Paper crafts & stationery',
  'Other creative products',
];

export const FoundingCreatorApply: React.FC<FoundingCreatorApplyProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    applicationId: string;
    applicantEmail: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // SECTION A: Personal Details
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // SECTION B: Creator & Business Details
  const [creatorType, setCreatorType] = useState<CreatorType>('Individual');
  const [brandName, setBrandName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Crochet & yarn crafts']);
  const [intro, setIntro] = useState('');
  const [craftDescription, setCraftDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('1-3 years');
  const [monthlyCapacity, setMonthlyCapacity] = useState('20-50 pieces');
  const [craftMethod, setCraftMethod] = useState<'handmade' | 'customized' | 'sourced'>('handmade');
  const [leadTime, setLeadTime] = useState('3-5 business days');
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(true);
  const [sellsElsewhere, setSellsElsewhere] = useState('Instagram DMs & Pop-up stalls');

  // SECTION C: Portfolio & Verification Files
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; size?: number; type?: string }[]
  >([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [gstin, setGstin] = useState('');

  // SECTION D: Agreements
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCommission, setAgreeCommission] = useState(false);
  const [agreeAuthenticity, setAgreeAuthenticity] = useState(false);
  const [agreeShippingPayout, setAgreeShippingPayout] = useState(false);

  // Form error state
  const [errorMessage, setErrorMessage] = useState('');

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    setErrorMessage('');

    try {
      const fileList = Array.from(files);
      for (const file of fileList) {
        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`File ${file.name} exceeds 10MB limit.`);
          continue;
        }

        const url = await foundingCreatorService.uploadPortfolioFile(file, `draft-${Date.now()}`);
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url,
            size: file.size,
            type: file.type,
          },
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill all mandatory personal and location fields.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!intro.trim() || !craftDescription.trim()) {
      setErrorMessage('Please provide a short bio and description of your creative craft process.');
      return false;
    }
    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one craft category.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (uploadedFiles.length === 0 && !instagramUrl.trim() && !portfolioUrl.trim()) {
      setErrorMessage('Please provide at least one portfolio image upload or an active Instagram / Portfolio link.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // Final Submission
  const handleSubmitApplication = async () => {
    if (!agreeTerms || !agreeCommission || !agreeAuthenticity || !agreeShippingPayout) {
      setErrorMessage('Please accept all Founding Creator terms and policies to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await foundingCreatorService.submitApplication({
        fullName,
        displayName: displayName || fullName,
        email,
        phone,
        city,
        state,
        pincode,
        brandName,
        creatorType,
        categories: selectedCategories,
        intro,
        craftDescription,
        yearsExperience,
        monthlyCapacity,
        craftMethod,
        leadTime,
        acceptsCustomOrders,
        sellsElsewhere,
        socialLinks: {
          instagram: instagramUrl,
          portfolio: portfolioUrl,
        },
        portfolioFiles: uploadedFiles,
      });

      // Notify reactive event bus for instant sync across admin panels
      syncEventBus.notify('APPLICATION_UPDATED', result.application);

      setSubmissionSuccess({
        applicationId: result.application.applicationId,
        applicantEmail: result.application.applicantEmail,
      });
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (submissionSuccess) {
      navigator.clipboard?.writeText(submissionSuccess.applicationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
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
        <circle cx="85%" cy="20%" r="150" fill="none" stroke="#07545A" strokeWidth="0.8" strokeDasharray="3 6" />
        <circle cx="15%" cy="75%" r="180" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="5 7" />
      </svg>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('foundingcreator')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07474C] hover:text-[#B45309] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creator Program</span>
          </button>

          <button
            onClick={() => onNavigate('foundingcreator-login')}
            className="text-xs font-medium text-[#233837]/75 hover:text-[#07474C]"
          >
            Already applied? <span className="underline font-semibold">Login here</span>
          </button>
        </div>

        {/* Success Screen (Step 5) */}
        {currentStep === 5 && submissionSuccess ? (
          <div className="bg-white/95 rounded-3xl border border-[#07545A]/15 p-6 sm:p-10 shadow-[0_12px_32px_-6px_rgba(7,84,90,0.08)] text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-sans">
                Application Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#07474C] font-display tracking-tight">
                Welcome to the Founding Creator Cohort!
              </h2>
              <p className="text-xs sm:text-sm text-[#233837]/75 max-w-lg mx-auto font-normal">
                Your application has been registered and assigned to our artisan curation committee.
                A confirmation summary has been logged for <span className="font-semibold text-[#07474C]">{submissionSuccess.applicantEmail}</span>.
              </p>
            </div>

            {/* Application ID Card */}
            <div className="bg-[#FAF6EE] border border-[#07545A]/15 p-4 rounded-2xl max-w-sm mx-auto space-y-1">
              <span className="text-[10px] font-semibold text-[#687778] uppercase font-sans">Unique Application ID</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-mono font-bold text-[#07474C] select-all">
                  {submissionSuccess.applicationId}
                </span>
                <button
                  onClick={copyAppId}
                  className="p-1.5 rounded-lg text-[#07474C] hover:bg-[#07545A]/10 transition-colors cursor-pointer"
                  title="Copy Application ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Next Steps Checklist */}
            <div className="bg-[#FAF7F2] border border-[#07545A]/12 p-5 rounded-2xl text-left max-w-md mx-auto space-y-3 text-xs">
              <h4 className="font-semibold text-[#07474C] text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>What Happens Next?</span>
              </h4>
              <ul className="space-y-2 text-[#233837]/80">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#07545A]/10 text-[#07474C] font-semibold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>Portfolio Review:</strong> Our craft curators evaluate your photos and studio pedigree within 24–48 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#07545A]/10 text-[#07474C] font-semibold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>Approval Notification:</strong> You will be notified of approval and your creator dashboard will be activated.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#07545A]/10 text-[#07474C] font-semibold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>Product Listing:</strong> Once activated, submit products for public storefront listing under the 70/30 commission model.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(`foundingcreator-status?id=${submissionSuccess.applicationId}`)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Track Application Status
              </button>
              <button
                onClick={() => onNavigate('foundingcreator-login')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#07474C] border border-[#07545A]/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Go to Creator Login
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 rounded-3xl border border-[#07545A]/14 shadow-[0_12px_32px_-6px_rgba(7,84,90,0.08)] overflow-hidden">
            {/* Header / Stepper Progress Bar */}
            <div className="bg-gradient-to-r from-[#FAF6EE] to-[#F5ECE0] p-6 border-b border-[#07545A]/12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-2.5 py-0.5 rounded-full inline-block font-sans">
                    Founding Creator Application
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#07474C] font-display mt-1 tracking-tight">
                    Apply to Join the Curowit Atelier
                  </h1>
                </div>
                <span className="text-xs font-semibold text-[#07474C] bg-white px-3 py-1 rounded-full border border-[#07545A]/15 shadow-2xs font-sans">
                  Step {currentStep} of 4
                </span>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-semibold">
                <div className={`pb-2 border-b-2 transition-colors truncate ${currentStep >= 1 ? 'border-[#07545A] text-[#07474C]' : 'border-stone-200 text-stone-400'}`}>
                  1. Personal
                </div>
                <div className={`pb-2 border-b-2 transition-colors truncate ${currentStep >= 2 ? 'border-[#07545A] text-[#07474C]' : 'border-stone-200 text-stone-400'}`}>
                  2. Studio
                </div>
                <div className={`pb-2 border-b-2 transition-colors truncate ${currentStep >= 3 ? 'border-[#07545A] text-[#07474C]' : 'border-stone-200 text-stone-400'}`}>
                  3. Portfolio
                </div>
                <div className={`pb-2 border-b-2 transition-colors truncate ${currentStep >= 4 ? 'border-[#07545A] text-[#07474C]' : 'border-stone-200 text-stone-400'}`}>
                  4. Terms
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM BODY */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#07545A] font-display flex items-center gap-2">
                    <span>Section A: Personal & Account Credentials</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Meera Sharma"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Creator / Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Meera Sharma (Studio Dhaga)"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Email Address (Used for Login & Notices) *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="creator@yourstudio.in"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Mobile Number (+91) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98201 44521"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Portal Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Jaipur"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Rajasthan"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="302001"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Instagram Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/your_handle"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Website / Portfolio URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Creator & Business Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#07545A] font-display">
                    Section B: Creator & Craft Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Creator Type *</label>
                      <select
                        value={creatorType}
                        onChange={(e) => setCreatorType(e.target.value as CreatorType)}
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A] font-semibold"
                      >
                        <option value="Individual">Individual Artisan / Solo Maker</option>
                        <option value="Student">Student Creator</option>
                        <option value="Hobbyist">Passionate Hobbyist</option>
                        <option value="Small Business">Small Studio / Atelier</option>
                        <option value="Registered Business">Registered Business / Cooperative</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Brand / Studio Name
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Studio Dhaga"
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1.5">
                      Craft Categories (Select all that apply) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES_LIST.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A]'
                                : 'bg-[#FFFDF7] text-[#173B3D]/70 border-[#07545A]/20 hover:border-[#07545A]'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">
                      Short Creator Bio (Who you are) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={intro}
                      onChange={(e) => setIntro(e.target.value)}
                      placeholder="e.g. Self-taught crochet artist creating heirloom toys and accessories from Rajasthan..."
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">
                      Description of Creative Work & Craft Process *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={craftDescription}
                      onChange={(e) => setCraftDescription(e.target.value)}
                      placeholder="Detail your material sourcing, crafting techniques, and whether pieces are made by hand or custom designed..."
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Experience</label>
                      <select
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs font-semibold"
                      >
                        <option value="Under 1 year">Under 1 year</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Monthly Capacity</label>
                      <select
                        value={monthlyCapacity}
                        onChange={(e) => setMonthlyCapacity(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs font-semibold"
                      >
                        <option value="10-25 pieces">10-25 pieces</option>
                        <option value="25-50 pieces">25-50 pieces</option>
                        <option value="50-100 pieces">50-100 pieces</option>
                        <option value="100+ pieces">100+ pieces</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Dispatch Lead Time</label>
                      <select
                        value={leadTime}
                        onChange={(e) => setLeadTime(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs font-semibold"
                      >
                        <option value="1-2 business days">1-2 business days (Ready stock)</option>
                        <option value="3-5 business days">3-5 business days</option>
                        <option value="5-7 business days">5-7 business days</option>
                        <option value="1-2 weeks">1-2 weeks (Made to order)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#07545A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptsCustomOrders}
                        onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                        className="w-4 h-4 accent-[#07545A] rounded"
                      />
                      <span>Accepts personalized / custom requests</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-[#07545A] cursor-pointer">
                      <input
                        type="radio"
                        checked={craftMethod === 'handmade'}
                        onChange={() => setCraftMethod('handmade')}
                        className="accent-[#07545A]"
                      />
                      <span>100% Handmade</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: Portfolio & File Uploads */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#07545A] font-display">
                      Section C: Portfolio & Craft Verification
                    </h3>
                    <p className="text-xs text-[#173B3D]/70 mt-0.5">
                      Upload high-resolution images of your finished pieces. Uploaded to secure Firebase Storage.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-[#07545A]/25 rounded-2xl p-6 text-center bg-[#FFF8EA]/30 hover:bg-[#FFF8EA]/60 transition-colors">
                    <input
                      type="file"
                      id="portfolio-upload"
                      multiple
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingFile}
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#07545A]/10 text-[#07545A] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-xs text-[#07545A]">
                        {isUploadingFile ? 'Uploading to Firebase Storage...' : 'Click to Upload Craft Images / Lookbook'}
                      </span>
                      <span className="text-[11px] text-[#173B3D]/60">
                        Supports PNG, JPG, WebP, PDF (Max 10MB per file)
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#07545A] block">
                        Attached Files ({uploadedFiles.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-[#FFFDF7] border border-[#07545A]/15 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#07545A] shrink-0" />
                              <span className="truncate font-medium">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUploadedFile(idx)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business verification (Optional) */}
                  <div className="pt-2 border-t border-[#07545A]/10">
                    <label className="text-xs font-bold text-[#07545A] block mb-1">
                      GSTIN / Artisan Card / Registration No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 08AAAAA0000A1Z5 or Artisan Card ID"
                      className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
                    />
                    <span className="text-[10px] text-[#687778] block mt-1">
                      Sole artisans and students do not require GST registration to sell on Curowit.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Agreements & Commercial Terms */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#07545A] font-display">
                      Section D: Founding Creator Terms & 70/30 Commercial Model
                    </h3>
                    <p className="text-xs text-[#173B3D]/70 mt-0.5">
                      Review and accept the partnership agreement before formal submission.
                    </p>
                  </div>

                  {/* Commercial Split Card */}
                  <div className="bg-[#FFF8EA] border-2 border-[#07545A]/20 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#07545A] uppercase tracking-wider">
                        Program Commercial Terms (v1.0-founding)
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        70/30 Split
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-[#07545A]/10">
                        <span className="text-[10px] font-bold text-[#687778] uppercase block">Creator Share</span>
                        <span className="text-2xl font-black text-[#07545A] font-display">70%</span>
                        <span className="text-[10px] text-[#173B3D]/70 block mt-0.5">
                          Calculated directly on selling price
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#07545A]/10">
                        <span className="text-[10px] font-bold text-[#687778] uppercase block">Curowit Commission</span>
                        <span className="text-2xl font-black text-[#E97868] font-display">30%</span>
                        <span className="text-[10px] text-[#173B3D]/70 block mt-0.5">
                          Covers gateway fees, marketing & hosting
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#173B3D]/80 leading-relaxed pt-1">
                      <strong>7-Day Post-Delivery Payout Cycle:</strong> Creator earnings enter eligible status exactly 7 calendar days after confirmed parcel delivery. Payouts are transferred via UPI or IMPS Bank Transfer.
                    </p>
                  </div>

                  {/* Mandatory checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-[#173B3D]/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#07545A] rounded"
                      />
                      <span>
                        I accept the <strong>Founding Creator Program Agreement</strong> and agree to adhere to Curowit community conduct standards.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-[#173B3D]/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeCommission}
                        onChange={(e) => setAgreeCommission(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#07545A] rounded"
                      />
                      <span>
                        I acknowledge and accept the <strong>70% Creator / 30% Curowit commercial revenue share</strong> on all marketplace sales.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-[#173B3D]/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeAuthenticity}
                        onChange={(e) => setAgreeAuthenticity(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#07545A] rounded"
                      />
                      <span>
                        I warrant that all products submitted are <strong>authentic, slow-crafted, and free of copyright or counterfeit infringements</strong>.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-[#173B3D]/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeShippingPayout}
                        onChange={(e) => setAgreeShippingPayout(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#07545A] rounded"
                      />
                      <span>
                        I agree to fulfill orders within the stated preparation lead times using plastic-free packaging, and accept the <strong>7-day post-delivery settlement rule</strong>.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-[#07545A]/12">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#07545A] hover:bg-[#07545A]/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && validateStep1()) setCurrentStep(2);
                      else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
                      else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Founding Creator Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
