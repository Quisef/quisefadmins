'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Award, BookOpen, TrendingUp, Calendar, Clock,
  ChevronLeft, ChevronRight, Sparkles, ArrowRight, Loader2,
  ChevronDown, Users, Rocket, DollarSign, Network, Lightbulb, Target
} from 'lucide-react';
import {
  generateUniqueId,
  saveRegistration,
  sendConfirmationEmail
} from '@/lib/registrationService';

// ────────────────────────────────────────────────
// Metadata for SEO (Next.js App Router)
const metadata = {
  title: 'FuturenTrepeneurship NYSC 2026 – Entrepreneurship Training & Funding Program Nigeria',
  description: 'Register now for FuturenTrepeneurship NYSC Cohort 2026 – hybrid entrepreneurship training, mentorship, seed funding, grants & alumni network by Quiet Shelter Empowerment Foundation. Limited slots – Feb 10 to March 9, 2026.',
  keywords: [
    'NYSC entrepreneurship program 2026',
    'NYSC business training Nigeria',
    'youth entrepreneurship Nigeria',
    'seed funding NYSC',
    'entrepreneurship mentorship Nigeria',
    'FuturenTrepeneurship registration',
    'QuiSEF entrepreneurship program',
    'NYSC corps members business',
    'grant eligible training 2026'
  ].join(', '),
  openGraph: {
    title: 'FuturenTrepeneurship NYSC 2026 – Start Your Entrepreneurial Journey',
    description: 'Join the NYSC 2026 cohort for world-class entrepreneurship training, mentorship, pitch competitions & funding opportunities. Register before slots run out!',
    url: 'https://quietshelter.org/futurentrepreneurship26', // ← replace with your actual domain
    siteName: 'FuturenTrepeneurship',
    images: [
      {
        url: '/og-image.jpg', // ← place a real 1200×630 image in /public/
        width: 1200,
        height: 630,
        alt: 'FuturenTrepeneurship NYSC 2026 – Youth Empowerment Program',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FuturenTrepeneurship NYSC 2026 – Entrepreneurship & Funding',
    description: 'Empowering Nigerian youth with training, mentorship & seed funding. Register today!',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://quietshelter.org/futurentrepreneurship26',
  },
};

// ────────────────────────────────────────────────
// Static data
// ────────────────────────────────────────────────
const BENEFITS = [
  { 
    title: 'Transform Your Business Idea', 
    description: 'Turn your entrepreneurial vision into a viable, fundable business with our comprehensive training modules and expert mentorship.',
    icon: 'rocket'
  },
  { 
    title: 'Access to Funding & Grants', 
    description: 'Compete for seed funding, grants, and investment opportunities through our business plan competition and investor network.',
    icon: 'money'
  },
  { 
    title: 'Lifetime Network & Community', 
    description: 'Join a powerful alumni network of entrepreneurs, mentors, and industry leaders who will support your journey for years to come.',
    icon: 'network'
  },
  { 
    title: 'Industry-Ready Skills', 
    description: 'Master essential business skills including financial management, marketing, operations, and strategic planning from seasoned professionals.',
    icon: 'skills'
  },
  { 
    title: 'Personalized Mentorship', 
    description: 'Get one-on-one guidance from successful entrepreneurs who understand your challenges and can help you navigate obstacles.',
    icon: 'mentor'
  },
  { 
    title: 'Launch with Confidence', 
    description: 'Graduate with a complete business plan, validated strategy, and the confidence to launch and scale your venture successfully.',
    icon: 'launch'
  },
];

const CATEGORIES = [
  {
    id: 'fully-funded', name: 'Fully Funded Registration', type: 'Competitive', slots: 100, price: '₦50,000', originalPrice: '₦100,000',
    color: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200', badge: 'bg-emerald-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Grant eligible','Lifetime Alumni Network access','Graduation ceremony (transport + accommodation)'],
    notIncluded: [] as string[],
  },
  {
    id: 'partially-funded', name: 'Partially Funded Registration', type: 'Competitive', slots: 100, price: '₦50,000', originalPrice: '₦100,000',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200', badge: 'bg-blue-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Seed funding','Lifetime Alumni Network access','Graduation ceremony attendance'],
    notIncluded: ['Transportation to graduation ceremony','Accommodation during graduation'],
  },
  {
    id: 'basic', name: 'Basic Registration', type: 'Standard', slots: 100, price: '₦20,000', originalPrice: '₦40,000',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200', badge: 'bg-purple-600',
    benefits: ['Core training modules','Alumni Network access','Graduation ceremony attendance','Business plan competition (performance-based)'],
    notIncluded: ['Dedicated mentorship','Transportation & accommodation for graduation'],
  },
  {
    id: 'self-funded', name: 'Self-Funded Registration', type: 'Grantee Selection', slots: 100, price: '₦70,000', originalPrice: '₦500,000',
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
// Benefits Carousel
// ────────────────────────────────────────────────
function BenefitsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % BENEFITS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (iconType: string) => {
    const iconProps = { className: "w-14 h-14 mx-auto mb-6 text-amber-300" };
    switch(iconType) {
      case 'rocket': return <Rocket {...iconProps} />;
      case 'money': return <DollarSign {...iconProps} />;
      case 'network': return <Users {...iconProps} />;
      case 'skills': return <BookOpen {...iconProps} />;
      case 'mentor': return <Award {...iconProps} />;
      case 'launch': return <Target {...iconProps} />;
      default: return <Sparkles {...iconProps} />;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-teal-900/80" />
      
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">Why Join FuturenTrepeneurship?</h2>

        <div className="relative min-h-[280px]">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                i === index ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95 pointer-events-none'
              }`}
            >
              <div className="text-center max-w-3xl mx-auto px-4">
                {getIcon(benefit.icon)}
                <h3 className="text-2xl md:text-3xl font-bold mb-6">{benefit.title}</h3>
                <p className="text-lg md:text-xl leading-relaxed text-white/90">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-6 mt-8">
          <button onClick={() => setIndex(i => (i - 1 + BENEFITS.length) % BENEFITS.length)} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm" aria-label="Previous">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            {BENEFITS.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`h-3 rounded-full transition-all ${i === index ? 'w-10 bg-white shadow-lg' : 'w-3 bg-white/50'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => setIndex(i => (i + 1) % BENEFITS.length)} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition backdrop-blur-sm" aria-label="Next">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Category Card
// ────────────────────────────────────────────────
function CategoryCard({ category, onSelect }: { category: Category; onSelect: () => void }) {
  const calculateDiscount = () => {
    const original = parseFloat(category.originalPrice.replace(/[₦,]/g, ''));
    const current = parseFloat(category.price.replace(/[₦,]/g, ''));
    return Math.round(((original - current) / original) * 100);
  };
  
  const discountPercentage = calculateDiscount();
  
  return (
    <div className={`${category.color} border-2 rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 group flex flex-col`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{category.name}</h3>
          <span className={`inline-block ${category.badge} text-white text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide`}>{category.type}</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 line-through mb-1">{category.originalPrice}</p>
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold">-{discountPercentage}%</span>
            <p className="text-xl font-extrabold text-gray-900 tracking-tight">{category.price}</p>
          </div>
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
// Main Component
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

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 mb-8">
            <p className="text-sm text-gray-600 mb-3 uppercase tracking-wider font-semibold">Your Registration ID</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{uniqueId}</p>
          </div>

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
            className="mb-8 text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-2 transition hover:underline"
          >
            ← Back to Categories
          </button>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100/80">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-4">
              Complete Your Registration
            </h2>
            <p className="text-xl text-gray-700 mb-10">
              Selected plan: <strong className="text-emerald-700 font-bold">{selectedCategory.name}</strong>
            </p>

            {submitError && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-5 rounded-2xl mb-8 shadow-sm">{submitError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {fields.map(field => (
                <div key={field}>
                  <label className="block text-base font-semibold text-gray-800 mb-3 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} *
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all focus:ring-4 focus:outline-none text-gray-900 text-lg placeholder-gray-500 shadow-sm ${
                      errors[field]
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500 hover:border-emerald-400'
                    }`}
                    placeholder={
                      field === 'areaOfInterest'
                        ? 'e.g. Agriculture, Tech, Fashion, Content Creation, Trading…'
                        : ''
                    }
                  />
                  {errors[field] && <p className="mt-2 text-base text-red-600 font-medium">{errors[field]}</p>}
                </div>
              ))}

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 shadow-inner mt-10">
                <p className="text-lg font-semibold text-gray-800 mb-3">Your Selected Plan</p>
                <p className="text-3xl font-black text-emerald-800">{selectedCategory.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-2xl text-gray-500 line-through">{selectedCategory.originalPrice}</p>
                  <p className="text-5xl font-extrabold text-gray-950 tracking-tight">{selectedCategory.price}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl disabled:opacity-60 flex items-center justify-center gap-4 transform hover:scale-[1.02] active:scale-95"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-8 h-8 animate-spin" /> Processing…</>
                ) : (
                  <>Confirm & Secure My Spot →</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LANDING PAGE ────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/40">
      {/* Hero – cinematic version */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-teal-800 to-blue-950 text-white py-32 md:py-48 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-gradient-to-r from-teal-200 via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl animate-pulse-slow">
            FuturenTrepeneurship
          </h1>
          <p className="text-3xl md:text-5xl mb-6 font-semibold text-teal-100 drop-shadow-lg">
            NYSC Youth Empowerment & Entrepreneurship Program 2026
          </p>
          <p className="text-2xl md:text-3xl mb-12 text-white/90 max-w-4xl mx-auto">
            Turn your idea into a funded reality with mentorship, training, grants & lifelong network.
          </p>

          <div className="inline-block bg-black/30 backdrop-blur-2xl rounded-3xl px-10 py-6 mb-14 border border-white/20 shadow-2xl">
            <p className="text-xl uppercase tracking-widest font-bold mb-2 text-teal-200">Organized by</p>
            <p className="text-3xl font-extrabold text-white">Quiet Shelter Empowerment Foundation</p>
          </div>

          <div className="mb-16">
            <p className="text-3xl font-bold text-amber-300 mb-6 animate-bounce-slow">
              Limited Slots – Register Before March 9, 2026!
            </p>
            <a
              href="#categories"
              className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-6 rounded-full font-extrabold text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 ring-4 ring-amber-400/40"
            >
              Claim Your Spot Now <ArrowRight className="w-10 h-10" />
            </a>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              <Clock className="w-12 h-12 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-black">Registration Closes In</h2>
            </div>
            <CountdownTimer targetDate="2026-03-09T23:59:59" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-20 md:py-28">
        {/* Overview */}
        <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 md:p-16 mb-20 border border-gray-100/80">
          <h2 className="text-5xl font-black text-gray-900 mb-10 text-center">Unlock Your Entrepreneurial Future</h2>
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

        <BenefitsCarousel />

        {/* Categories */}
        <section id="categories" className="my-24 scroll-mt-20">
          <h2 className="text-5xl md:text-6xl font-black text-center text-gray-900 mb-16 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Choose Your Path to Success
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
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

        {/* Final big CTA */}
        <div className="relative text-center my-20 rounded-3xl overflow-hidden p-16 md:p-24">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-900/90" />
          
          <div className="relative z-10">
            <p className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-lg">
              Ready to Build Your Future?
            </p>
            <a
              href="#categories"
              className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-16 py-8 rounded-full font-extrabold text-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 ring-8 ring-amber-400/40"
            >
              Secure Your Registration Now <Sparkles className="w-10 h-10 animate-pulse" />
            </a>
          </div>
        </div>

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

      <footer className="bg-gradient-to-br from-gray-950 to-black text-white py-16 px-5 mt-24">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-lg">© 2026 Quiet Shelter Empowerment Foundation (QuiSEF)</p>
          <p className="text-gray-300 mt-4 text-xl">Empowering Nigeria's Next Generation of Entrepreneurs</p>
        </div>
      </footer>
    </div>
  );
}