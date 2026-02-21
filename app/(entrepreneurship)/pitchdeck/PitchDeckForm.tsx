'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload, FileText, Check, Loader2, ArrowLeft,
  Lightbulb, AlertCircle
} from 'lucide-react';

// Inline client-side submission helper (file is optional)
async function savePitchDeck(data: any, file: File | null) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, String(v ?? '')));
  if (file) form.append('pitchDeck', file);

  let res: Response;
  try {
    res = await fetch('/api/pitchdeck', {
      method: 'POST',
      body: form,
    });
  } catch (err) {
    console.error('Pitch deck fetch error:', err);
    throw new Error(
      'Unable to connect. Please check your internet connection and try again.'
    );
  }

  const bodyText = await res.text();
  if (!res.ok) {
    try {
      const json = JSON.parse(bodyText);
      throw new Error(json.error || json.message || 'Submission failed');
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message !== 'Submission failed') {
        throw parseErr;
      }
      throw new Error(bodyText || 'Submission failed');
    }
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return { success: true };
  }
}

export default function PitchDeckForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    registrationId: '',
    fullName: '',
    email: '',
    category: '',
    pitchInfo: '', // Single field: business info, problem, solution, market, revenue, team, etc.
  });

  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [filePreview,   setFilePreview]   = useState('');

  const [notEligible, setNotEligible] = useState(false);

  // ── Auto-populate from URL params & check eligibility ───────────
  useEffect(() => {
    const id       = searchParams.get('id');
    const name     = searchParams.get('name');
    const email    = searchParams.get('email');
    const category = searchParams.get('category');

    if (id && name && email && category) {
      const cat = decodeURIComponent(category);
      const catId = cat.toLowerCase().includes('fully funded') ? 'fully-funded' 
        : cat.toLowerCase().includes('partially funded') ? 'partially-funded'
        : cat.toLowerCase().includes('basic') ? 'basic'
        : cat.toLowerCase().includes('self-funded') ? 'self-funded' : '';
      setNotEligible(!['fully-funded', 'partially-funded'].includes(catId));
      setFormData(prev => ({
        ...prev,
        registrationId: decodeURIComponent(id),
        fullName:       decodeURIComponent(name),
        email:          decodeURIComponent(email),
        category:       cat,
      }));
    }
  }, [searchParams]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev  => ({ ...prev, [e.target.name]: '' }));
    setSubmitError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, pitchDeck: 'Please upload a PDF or PowerPoint file' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, pitchDeck: 'File size must be less than 10MB' }));
      return;
    }

    setPitchDeckFile(file);
    setFilePreview(file.name);
    setErrors(prev => ({ ...prev, pitchDeck: '' }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.pitchInfo.trim()) errs.pitchInfo = 'Please provide your business pitch information';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await savePitchDeck(formData, pitchDeckFile);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Pitch deck submission error:', error);
      // Surface the real error message from the service / API instead of a generic string
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Submission failed. Please try again or contact support.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen - Enhanced Mobile Responsive ─────────────────
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-center border border-gray-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse">
            <Check className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Pitch Deck Submitted!</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2">Your innovative business pitch has been successfully submitted</p>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 uppercase tracking-wider font-semibold">Registration ID</p>
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4 sm:mb-6 break-all">
              {formData.registrationId}
            </p>
            <div className="space-y-2 text-left border-t border-emerald-200 pt-4">
              <p className="text-sm sm:text-base text-gray-700 break-words"><span className="font-semibold">Submitted by:</span> {formData.fullName}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 text-left">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" /> What's Next?
            </h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              {[
                'Our review team will evaluate your pitch deck within 5–7 business days',
                'Shortlisted candidates will be invited for a pitch presentation',
                'Winners will receive seed funding and mentorship',
                'Check your email regularly for updates',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/futurentrepreneurship26"
            className="inline-block w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-xl hover:shadow-2xl text-base sm:text-lg"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // ── Not eligible (basic/self-funded) ─────────────────────────────
  if (notEligible && formData.registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/60 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-center border border-amber-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 text-amber-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Pitch Deck Not Required</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Your registration category ({formData.category}) does not require a pitch deck submission. 
            You will receive a confirmation email with your program details.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Only Fully Funded and Partially Funded registrations participate in the pitch deck competition for funding opportunities.
          </p>
          <a href="/futurentrepreneurship26" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
            Return to Program
          </a>
        </div>
      </div>
    );
  }

  // ── Form page - Enhanced Mobile Responsive ──────────────────────
  const inputClass = (field: string) =>
    `w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl transition focus:ring-2 focus:outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
      errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/30 py-8 sm:py-12 px-4 sm:px-5">
      <div className="max-w-5xl mx-auto">

        {/* Header banner - Enhanced Mobile */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-blue-800 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">Submit Your Pitch Deck</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-teal-100 mb-5 sm:mb-6">Transform your innovative idea into a funded reality</p>

          <div className="bg-white/15 backdrop-blur-xl rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/20">
            <p className="text-xs sm:text-sm uppercase tracking-wider font-semibold mb-3">Your Registration</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base">
              <div>
                <span className="text-teal-200 text-xs sm:text-sm">ID:</span>
                <p className="font-bold text-base sm:text-lg break-all">{formData.registrationId || 'Not set'}</p>
              </div>
              <div>
                <span className="text-teal-200 text-xs sm:text-sm">Name:</span>
                <p className="font-bold text-base sm:text-lg break-words">{formData.fullName || 'Not set'}</p>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <span className="text-teal-200 text-xs sm:text-sm">Category:</span>
                <p className="font-bold text-base sm:text-lg break-words">{formData.category || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines - Enhanced Mobile */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 flex-shrink-0" /> 
            <span>Pitch Deck Guidelines</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-100">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Include These Sections
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                {['Problem & Solution','Market Opportunity','Business Model','Competitive Advantage','Financial Projections','Team & Milestones'].map(s => <li key={s}>• {s}</li>)}
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" /> Technical Requirements
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                {['Format: PDF or PowerPoint (.pptx)','Maximum size: 10MB','Recommended: 10–15 slides','Clear, professional design','Include contact information'].map(s => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-xl">
            <p className="text-sm sm:text-base text-gray-700">
              <strong>💡 Pro Tip:</strong> Focus on solving a real problem with a scalable solution. Show traction, market research, and a clear path to profitability.
            </p>
          </div>
        </div>

        {/* Form - Enhanced Mobile */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Business Information</h2>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-5 py-3 sm:py-4 rounded-xl mb-5 sm:mb-6 flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Single pitch info field */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Business Pitch Information *
              </label>
              <textarea
                name="pitchInfo"
                value={formData.pitchInfo}
                onChange={handleChange}
                rows={12}
                className={`${inputClass('pitchInfo')} resize-none`}
                placeholder="Include: startup/business name, description, problem statement, solution, target market, revenue model, funding needs, team size, and any other relevant details…"
              />
              {errors.pitchInfo && <p className="mt-1.5 text-sm text-red-600">{errors.pitchInfo}</p>}
            </div>

            {/* Optional file upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Upload Pitch Deck (optional)
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition ${
                errors.pitchDeck ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-500 bg-gray-50'
              }`}>
                <input 
                  type="file" 
                  id="pitchDeck" 
                  accept=".pdf,.ppt,.pptx" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <label htmlFor="pitchDeck" className="cursor-pointer">
                  {filePreview ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-emerald-700">
                      <FileText className="w-8 h-8 flex-shrink-0" />
                      <div className="text-center sm:text-left">
                        <p className="font-semibold text-sm sm:text-base break-all">{filePreview}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">Click to upload slides or PDF (optional)</p>
                      <p className="text-xs sm:text-sm text-gray-500">PDF or PowerPoint, Max 10MB</p>
                    </>
                  )}
                </label>
              </div>
              {errors.pitchDeck && <p className="mt-1.5 text-sm text-red-600">{errors.pitchDeck}</p>}
            </div>

            {/* Submit button - Enhanced Mobile */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
            >
              {isSubmitting
                ? (<><Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> Submitting…</>)
                : (<><Upload className="w-5 h-5 sm:w-6 sm:h-6" /> Submit Pitch Deck</>)}
            </button>
          </form>
        </div>

        {/* Back link - Enhanced Mobile */}
        <div className="text-center mt-6 sm:mt-8">
          <a 
            href="/futurentrepreneurship26" 
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Registration
          </a>
        </div>
      </div>
    </div>
  );
}