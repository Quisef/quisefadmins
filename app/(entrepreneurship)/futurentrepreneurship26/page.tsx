'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Award, BookOpen, TrendingUp, Calendar, Clock,
  ChevronLeft, ChevronRight, Sparkles, ArrowRight, Loader2,
  ChevronDown, Users
} from 'lucide-react';
import {
  generateUniqueId,
  saveRegistration,
  sendConfirmationEmail
} from '@/lib/registrationService';

// ────────────────────────────────────────────────
// Static data – hoisted so they are never
// recreated on every render.
// ────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Chioma Adeleke',   batch: '2025 Batch A', quote: 'This program turned my business idea into a funded reality. The mentorship was world-class.',   business: 'Tech Solutions Ltd' },
  { name: 'Ibrahim Mohammed', batch: '2025 Batch B', quote: 'The seed funding and guidance helped launch my agribusiness successfully.',                      business: 'Green Farms Nigeria' },
  { name: 'Blessing Okafor',  batch: '2025 Batch A', quote: 'The network and connections opened doors I never imagined possible.',                           business: 'Fashion Forward'     },
];

const CATEGORIES = [
  {
    id: 'fully-funded', name: 'Fully Funded Registration', type: 'Competitive', slots: 100, price: '₦20,000',
    color: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200', badge: 'bg-emerald-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Grant eligible','Lifetime Alumni Network access','Graduation ceremony (transport + accommodation)'],
    notIncluded: [] as string[],
  },
  {
    id: 'partially-funded', name: 'Partially Funded Registration', type: 'Competitive', slots: 100, price: '₦20,000',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200', badge: 'bg-blue-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Seed funding','Lifetime Alumni Network access','Graduation ceremony attendance'],
    notIncluded: ['Transportation to graduation ceremony','Accommodation during graduation'],
  },
  {
    id: 'basic', name: 'Basic Registration', type: 'Standard', slots: 100, price: '₦10,000',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200', badge: 'bg-purple-600',
    benefits: ['Core training modules','Alumni Network access','Graduation ceremony attendance','Business plan competition (performance-based)'],
    notIncluded: ['Dedicated mentorship','Transportation & accommodation for graduation'],
  },
  {
    id: 'self-funded', name: 'Self-Funded Registration', type: 'Grantee Selection', slots: 100, price: '₦20,000',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200', badge: 'bg-amber-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Grant eligible','Lifetime Alumni Network access','Graduation ceremony attendance'],
    notIncluded: ['Transportation to graduation ceremony','Accommodation during graduation'],
  },
];

type Category = typeof CATEGORIES[number];

const EMPTY_FORM = { fullName: '', email: '', phone: '', areaOfInterest: '', category: '' };

// ────────────────────────────────────────────────
// Countdown Timer
// ────────────────────────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const Unit = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-xl px-5 py-4 min-w-[85px] shadow-inner">
        <div className="text-4xl md:text-5xl font-extrabold text-white tabular-nums">
          {String(val).padStart(2, '0')}
        </div>
      </div>
      <div className="mt-2.5 text-sm md:text-base font-semibold text-white/90">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-4 md:gap-7 flex-wrap">
      <Unit val={time.days}    label="Days"    />
      <span className="text-4xl text-white/50">:</span>
      <Unit val={time.hours}   label="Hours"   />
      <span className="text-4xl text-white/50">:</span>
      <Unit val={time.minutes} label="Minutes" />
      <span className="text-4xl text-white/50">:</span>
      <Unit val={time.seconds} label="Seconds" />
    </div>
  );
}

// ────────────────────────────────────────────────
// Testimonial Carousel
// ────────────────────────────────────────────────
function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">Success Stories</h2>

      <div className="relative min-h-[220px]">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-700 ${
              i === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
            }`}
          >
            <div className="text-center max-w-3xl mx-auto px-4">
              <Sparkles className="w-14 h-14 mx-auto mb-6 text-amber-300 animate-pulse" />
              <p className="text-xl md:text-2xl italic mb-8 leading-relaxed">"{t.quote}"</p>
              <p className="text-xl font-bold">{t.name}</p>
              <p className="text-white/80 mt-1">{t.business} • {t.batch}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-6 mt-8">
        <button onClick={() => setIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm" aria-label="Previous">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-3">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-3 rounded-full transition-all ${i === index ? 'w-10 bg-white shadow' : 'w-3 bg-white/50'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <button onClick={() => setIndex(i => (i + 1) % TESTIMONIALS.length)} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm" aria-label="Next">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Category Card
// ────────────────────────────────────────────────
function CategoryCard({ category, onSelect }: { category: Category; onSelect: () => void }) {
  return (
    <div className={`${category.color} border-2 rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 group flex flex-col`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{category.name}</h3>
          <span className={`inline-block ${category.badge} text-white text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide`}>{category.type}</span>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold text-gray-900 tracking-tight">{category.price}</p>
          <p className="text-sm text-gray-600 mt-1">{category.slots} slots</p>
        </div>
      </div>

      <div className="mb-6 flex-1">
        <p className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <Check className="w-6 h-6 text-emerald-600 mr-2" /> What's Included
        </p>
        <ul className="space-y-3 text-gray-700">
          {category.benefits.map((b, i) => (
            <li key={i} className="flex items-start">
              <Check className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" /><span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {category.notIncluded.length > 0 && (
        <div className="mb-7">
          <p className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
            <X className="w-6 h-6 text-red-500 mr-2" /> Not Included
          </p>
          <ul className="space-y-3 text-gray-600">
            {category.notIncluded.map((item, i) => (
              <li key={i} className="flex items-start">
                <X className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" /><span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSelect}
        className="w-full mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-semibold hover:from-gray-800 hover:to-black transition-all shadow-lg hover:shadow-xl group-hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        Select & Register <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────
export default function FuturenTrepeneurship() {
  const [selectedCategory, setSelectedCategory]         = useState<Category | null>(null);
  const [showForm, setShowForm]                         = useState(false);
  const [formData, setFormData]                         = useState(EMPTY_FORM);
  const [errors, setErrors]                             = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting]                 = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [uniqueId, setUniqueId]                         = useState('');
  const [submitError, setSubmitError]                   = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev  => ({ ...prev, [e.target.name]: '' }));
    setSubmitError('');
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim())       errs.fullName       = 'Full name is required';
    if (!formData.email.includes('@') || !formData.email.includes('.'))
                                         errs.email          = 'Valid email required';
    if (!formData.phone.match(/^\+?\d{9,15}$/))
                                         errs.phone          = 'Valid phone number required';
    if (!formData.areaOfInterest.trim()) errs.areaOfInterest = 'Area of Interest is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedCategory) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const newUniqueId = generateUniqueId();

      await saveRegistration(
        {
          fullName:       formData.fullName,
          email:          formData.email,
          phone:          formData.phone,
          areaOfInterest: formData.areaOfInterest,
          category:       formData.category,
          categoryName:   selectedCategory.name,
          price:          selectedCategory.price,
        },
        newUniqueId
      );

      // uniqueId forwarded → /api/send-confirmation renders it in the email
      const emailSent = await sendConfirmationEmail(
        formData.email, formData.fullName, newUniqueId,
        selectedCategory.name, selectedCategory.price
      );
      if (!emailSent) console.warn('Email sending failed, but registration was saved');

      setUniqueId(newUniqueId);
      setRegistrationComplete(true);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('Registration failed. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setRegistrationComplete(false);
    setShowForm(false);
    setSelectedCategory(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setSubmitError('');
  };

  // ─── SUCCESS SCREEN ──────────────────────────
  if (registrationComplete && selectedCategory) {
    const pitchUrl =
      `/pitchdeck?id=${encodeURIComponent(uniqueId)}` +
      `&name=${encodeURIComponent(formData.fullName)}` +
      `&email=${encodeURIComponent(formData.email)}` +
      `&category=${encodeURIComponent(selectedCategory.name)}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Check className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Registration Confirmed!</h2>
          <p className="text-lg text-gray-600 mb-8">Thank you for joining FuturenTrepeneurship NYSC 2026</p>

          {/* Registration ID */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
            <p className="text-sm text-gray-600 mb-3 uppercase tracking-wider font-semibold">Your Registration ID</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{uniqueId}</p>
          </div>

          {/* Summary */}
          <div className="bg-teal-50 rounded-2xl p-7 mb-8 text-left border border-teal-100">
            <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">Name:</span>   {formData.fullName}</p>
              <p><span className="font-medium">Email:</span>  {formData.email}</p>
              <p><span className="font-medium">Plan:</span>   <span className="font-semibold text-emerald-700">{selectedCategory.name}</span></p>
              <p><span className="font-medium">Amount:</span> <span className="font-bold">{selectedCategory.price}</span></p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            A confirmation email (with your Registration ID) has been sent to <strong>{formData.email}</strong>.<br />
            Keep your ID safe — you'll need it to submit your pitch deck.
          </p>

          {/* Pitch-deck CTA */}
          <div className="mb-6">
            <a
              href={pitchUrl}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
            >
              Submit Your Pitch Deck <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <button
            onClick={reset}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-12 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-xl hover:shadow-2xl text-lg"
          >
            Register Another Person
          </button>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION FORM ───────────────────────
  if (showForm && selectedCategory) {
    const fields = ['fullName', 'email', 'phone', 'areaOfInterest'] as const;

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setShowForm(false); setSelectedCategory(null); setSubmitError(''); }}
            className="mb-8 text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-2 transition"
          >
            ← Back to Categories
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100/70">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Complete Your Registration</h2>
            <p className="text-gray-600 mb-10">Selected plan: <strong className="text-emerald-700">{selectedCategory.name}</strong></p>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">{submitError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {fields.map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} *
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border rounded-xl transition focus:ring-2 focus:outline-none ${
                      errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500'
                    }`}
                    placeholder={field === 'areaOfInterest' ? 'e.g. Agriculture, IT, Marketing, Media & Content Creation, Trading…' : ''}
                  />
                  {errors[field] && <p className="mt-1.5 text-sm text-red-600">{errors[field]}</p>}
                </div>
              ))}

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 mt-8">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Plan</p>
                <p className="text-2xl font-bold text-emerald-700">{selectedCategory.name}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">{selectedCategory.price}</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (<><Loader2 className="w-6 h-6 animate-spin" /> Processing…</>) : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── LANDING PAGE ────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/30">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-700 via-teal-700 to-blue-800 text-white py-24 md:py-32 px-5 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-5 tracking-tight">FuturenTrepeneurship</h1>
          <p className="text-2xl md:text-3xl mb-5 text-teal-100">Youth Empowerment & Development Program</p>
          <p className="text-xl md:text-2xl mb-10 text-white/90">NYSC Cohort • 2026</p>

          <div className="inline-block bg-white/15 backdrop-blur-xl rounded-2xl px-8 py-5 mb-12 border border-white/20">
            <p className="text-sm uppercase tracking-wider font-semibold mb-1">Organized by</p>
            <p className="text-2xl font-bold">Quiet Shelter Empowerment Foundation (QuiSEF)</p>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Clock className="w-8 h-8" />
              <h2 className="text-2xl md:text-3xl font-bold">Registration Closes In</h2>
            </div>
            <CountdownTimer targetDate="2026-03-09T23:59:59" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        {/* Overview */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Program Overview</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            Empowering Nigerian youth — especially NYSC corps members — with world-class entrepreneurship training, mentorship, funding access and lifelong networking to build sustainable businesses.
          </p>
          <div className="grid md:grid-cols-2 gap-7 mb-10">
            <div className="flex items-start gap-5 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <BookOpen className="w-10 h-10 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-xl">Hybrid Learning</h3>
                <p className="text-gray-700">Online platform + personalized in-person / virtual mentorship</p>
              </div>
            </div>
            <div className="flex items-start gap-5 p-6 bg-teal-50 rounded-2xl border border-teal-100">
              <TrendingUp className="w-10 h-10 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-xl">Real Growth</h3>
                <p className="text-gray-700">Grants, seed funding, pitch competitions & powerful networking</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-7 rounded-r-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-7 h-7 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xl">Registration Window</h3>
            </div>
            <p className="text-gray-800 mb-2 font-semibold">Feb 10 – March 9, 2026</p>
            <p className="text-gray-700">400 total slots • Cohort 1</p>
          </div>
        </section>

        <TestimonialCarousel />

        {/* Categories */}
        <section className="my-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-14">Choose Your Path</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onSelect={() => {
                  setSelectedCategory(cat);
                  setFormData(prev => ({ ...prev, category: cat.id }));
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        </section>

        {/* Partners */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Partners</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award,      name: 'American University of Nigeria', desc: 'Business School' },
              { icon: TrendingUp, name: 'Doba Agri-Finance',             desc: 'Limited'         },
              { icon: Users,      name: 'Wisdom Shelter',                desc: 'Limited'         },
            ].map((p, i) => (
              <div key={i} className="text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-lg transition">
                <p.icon className="w-14 h-14 text-emerald-600 mx-auto mb-5" />
                <h3 className="font-bold text-xl text-gray-900 mb-2">{p.name}</h3>
                <p className="text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'Who can apply?',            a: 'All Nigerian youth, especially current and recent NYSC corps members.' },
              { q: 'Is the program free?',      a: 'We offer competitive fully-funded and partially-funded slots, plus affordable self-funded options.' },
              { q: 'When does training start?', a: 'Training begins shortly after registration closes (March 2026 cohort).' },
              { q: 'Will I receive funding?',   a: 'Top performers in the business plan competition are eligible for seed grants.' },
            ].map((item, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold text-lg text-gray-800 hover:text-emerald-700 transition list-none">
                  {item.q}
                  <ChevronDown className="w-6 h-6 transition group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-gray-700">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-white py-12 px-5 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2026 Quiet Shelter Empowerment Foundation (QuiSEF)</p>
          <p className="text-gray-400 mt-3">Empowering the next generation of Nigerian entrepreneurs</p>
        </div>
      </footer>
    </div>
  );
}