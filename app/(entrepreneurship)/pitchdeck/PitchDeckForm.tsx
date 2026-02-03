'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload, FileText, Check, Loader2, ArrowLeft,
  Lightbulb, TrendingUp, Users, Target, DollarSign,
  AlertCircle
} from 'lucide-react';
import { savePitchDeck } from '@/lib/pitchDeckService';

export default function PitchDeckForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    registrationId:      '',
    fullName:            '',
    email:               '',
    category:            '',
    businessName:        '',
    businessDescription: '',
    problemStatement:    '',
    solution:            '',
    targetMarket:        '',
    revenueModel:        '',
    fundingNeeds:        '',
    teamSize:            '',
  });

  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [filePreview,   setFilePreview]   = useState('');

  // ── Auto-populate from URL params ──────────────────────────────
  useEffect(() => {
    const id       = searchParams.get('id');
    const name     = searchParams.get('name');
    const email    = searchParams.get('email');
    const category = searchParams.get('category');

    if (id && name && email && category) {
      setFormData(prev => ({
        ...prev,
        registrationId: decodeURIComponent(id),
        fullName:       decodeURIComponent(name),
        email:          decodeURIComponent(email),
        category:       decodeURIComponent(category),
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
    if (!formData.businessName.trim())        errs.businessName        = 'Business name is required';
    if (!formData.businessDescription.trim()) errs.businessDescription = 'Business description is required';
    if (!formData.problemStatement.trim())    errs.problemStatement    = 'Problem statement is required';
    if (!formData.solution.trim())            errs.solution            = 'Solution is required';
    if (!formData.targetMarket.trim())        errs.targetMarket        = 'Target market is required';
    if (!formData.revenueModel.trim())        errs.revenueModel        = 'Revenue model is required';
    if (!formData.fundingNeeds.trim())        errs.fundingNeeds        = 'Funding needs are required';
    if (!formData.teamSize)                   errs.teamSize            = 'Team size is required';
    if (!pitchDeckFile)                       errs.pitchDeck           = 'Pitch deck file is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await savePitchDeck(formData, pitchDeckFile!);
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

  // ── Success screen ──────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Check className="w-14 h-14 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pitch Deck Submitted!</h2>
          <p className="text-lg text-gray-600 mb-8">Your innovative business pitch has been successfully submitted</p>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
            <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-semibold">Registration ID</p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-6">
              {formData.registrationId}
            </p>
            <div className="space-y-2 text-left border-t border-emerald-200 pt-4">
              <p className="text-gray-700"><span className="font-semibold">Business Name:</span> {formData.businessName}</p>
              <p className="text-gray-700"><span className="font-semibold">Submitted by:</span>  {formData.fullName}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" /> What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Our review team will evaluate your pitch deck within 5–7 business days',
                'Shortlisted candidates will be invited for a pitch presentation',
                'Winners will receive seed funding and mentorship',
                'Check your email regularly for updates',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/futurentrepreneurship26"
            className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-12 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-xl hover:shadow-2xl text-lg"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // ── Form page ───────────────────────────────────────────────────
  const inputClass = (field: string) =>
    `w-full px-5 py-4 border rounded-xl transition focus:ring-2 focus:outline-none text-gray-900 placeholder-gray-400 ${
      errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500'
    }`;

  const textareas: { name: string; label: string; icon: React.FC<any>; placeholder: string; rows: number }[] = [
    { name: 'businessDescription', label: 'Business Description (Elevator Pitch)', icon: FileText,     placeholder: 'Describe your business in 2–3 sentences…',                   rows: 4 },
    { name: 'problemStatement',    label: 'Problem Statement',                     icon: AlertCircle,   placeholder: 'What problem are you solving? Why does it matter?',          rows: 4 },
    { name: 'solution',            label: 'Your Solution',                         icon: Lightbulb,     placeholder: 'How does your product / service solve the problem?',         rows: 4 },
    { name: 'targetMarket',        label: 'Target Market',                         icon: Users,         placeholder: 'Who are your customers? Market size and demographics…',      rows: 3 },
    { name: 'revenueModel',        label: 'Revenue Model',                         icon: TrendingUp,    placeholder: 'How will you make money? Pricing strategy…',               rows: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/30 py-12 px-5">
      <div className="max-w-5xl mx-auto">

        {/* Header banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-blue-800 text-white rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-black">Submit Your Pitch Deck</h1>
          </div>
          <p className="text-xl text-teal-100 mb-6">Transform your innovative idea into a funded reality</p>

          <div className="bg-white/15 backdrop-blur-xl rounded-xl p-5 border border-white/20">
            <p className="text-sm uppercase tracking-wider font-semibold mb-2">Your Registration</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-teal-200">ID:</span><p className="font-bold text-lg">{formData.registrationId || 'Not set'}</p></div>
              <div><span className="text-teal-200">Name:</span><p className="font-bold text-lg">{formData.fullName || 'Not set'}</p></div>
              <div><span className="text-teal-200">Category:</span><p className="font-bold text-lg">{formData.category || 'Not set'}</p></div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-600" /> Pitch Deck Guidelines
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Include These Sections</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Problem & Solution','Market Opportunity','Business Model','Competitive Advantage','Financial Projections','Team & Milestones'].map(s => <li key={s}>• {s}</li>)}
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-blue-600" /> Technical Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {['Format: PDF or PowerPoint (.pptx)','Maximum size: 10MB','Recommended: 10–15 slides','Clear, professional design','Include contact information'].map(s => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
            <p className="text-sm text-gray-700"><strong>💡 Pro Tip:</strong> Focus on solving a real problem with a scalable solution. Show traction, market research, and a clear path to profitability.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Business Information</h2>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Business Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Business / Startup Name *
              </label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className={inputClass('businessName')} placeholder="e.g., GreenTech Solutions" />
              {errors.businessName && <p className="mt-1.5 text-sm text-red-600">{errors.businessName}</p>}
            </div>

            {/* Dynamic textareas */}
            {textareas.map(({ name, label, icon: Icon, placeholder, rows }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-600" /> {label} *
                </label>
                <textarea
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  rows={rows}
                  className={`${inputClass(name)} resize-none`}
                  placeholder={placeholder}
                />
                {errors[name] && <p className="mt-1.5 text-sm text-red-600">{errors[name]}</p>}
              </div>
            ))}

            {/* Funding + Team row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Funding Needs *
                </label>
                <input type="text" name="fundingNeeds" value={formData.fundingNeeds} onChange={handleChange} className={inputClass('fundingNeeds')} placeholder="e.g., ₦2,000,000" />
                {errors.fundingNeeds && <p className="mt-1.5 text-sm text-red-600">{errors.fundingNeeds}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Team Size *
                </label>
                <select name="teamSize" value={formData.teamSize} onChange={handleChange} className={`${inputClass('teamSize')} bg-white`}>
                  <option value="">Select team size</option>
                  <option value="1">Solo Founder</option>
                  <option value="2-3">2–3 Members</option>
                  <option value="4-6">4–6 Members</option>
                  <option value="7+">7+ Members</option>
                </select>
                {errors.teamSize && <p className="mt-1.5 text-sm text-red-600">{errors.teamSize}</p>}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 text-emerald-600" /> Upload Pitch Deck *
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                errors.pitchDeck ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-500 bg-gray-50'
              }`}>
                <input type="file" id="pitchDeck" accept=".pdf,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
                <label htmlFor="pitchDeck" className="cursor-pointer">
                  {filePreview ? (
                    <div className="flex items-center justify-center gap-3 text-emerald-700">
                      <FileText className="w-8 h-8" />
                      <div className="text-left">
                        <p className="font-semibold">{filePreview}</p>
                        <p className="text-sm text-gray-600">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Click to upload pitch deck</p>
                      <p className="text-sm text-gray-500">PDF or PowerPoint (Max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
              {errors.pitchDeck && <p className="mt-1.5 text-sm text-red-600">{errors.pitchDeck}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isSubmitting
                ? (<><Loader2 className="w-6 h-6 animate-spin" /> Submitting…</>)
                : (<><Upload className="w-6 h-6" /> Submit Pitch Deck</>)}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/futurentrepreneurship26" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition">
            <ArrowLeft className="w-5 h-5" /> Back to Registration
          </a>
        </div>
      </div>
    </div>
  );
}