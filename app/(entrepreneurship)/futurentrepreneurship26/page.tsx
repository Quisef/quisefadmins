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
} from '@/lib/registrationService';

// ────────────────────────────────────────────────
// PAYSTACK PAYMENT LINKS INTEGRATION
// ────────────────────────────────────────────────
// Payment links for different categories:
// - ₦20,000 categories (Fully Funded, Partially Funded, Basic): 
//   https://paystack.shop/pay/EntrepreneurshipProgramPayment
// - ₦70,000 category (Self-Funded):
//   https://paystack.shop/pay/Self_Funded
// ────────────────────────────────────────────────

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
    id: 'fully-funded', 
    name: 'Fully Funded Registration', 
    type: 'Competitive', 
    slots: 100, 
    price: '₦20,000',
    paymentLink: 'https://paystack.shop/pay/testingx',
    color: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200', 
    badge: 'bg-emerald-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Grant eligible','Lifetime Alumni Network access','Graduation ceremony (transport + accommodation)','100% Program Fee Discount'],
    notIncluded: [] as string[],
  },
  {
    id: 'partially-funded', 
    name: 'Partially Funded Registration', 
    type: 'Competitive', 
    slots: 100, 
    price: '₦20,000',
    paymentLink: 'https://paystack.shop/pay/EntrepreneurshipProgramPayment',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200', 
    badge: 'bg-blue-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Seed funding','Lifetime Alumni Network access','Graduation ceremony attendance','100% Program Fee Discount'],
    notIncluded: ['Transportation to graduation ceremony','Accommodation during graduation'],
  },
  {
    id: 'basic', 
    name: 'Basic Registration', 
    type: 'Standard', 
    slots: 100, 
    price: '₦20,000',
    paymentLink: 'https://paystack.shop/pay/EntrepreneurshipProgramPayment',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200', 
    badge: 'bg-purple-600',
    benefits: ['Core training modules','Alumni Network access','Graduation ceremony attendance','Business plan competition (performance-based)','100% Program Fee Discount'],
    notIncluded: ['Dedicated mentorship','Transportation & accommodation for graduation'],
  },
  {
    id: 'self-funded', 
    name: 'Self-Funded Registration', 
    type: 'Grantee Selection', 
    slots: 100, 
    price: '₦70,000',
    paymentLink: 'https://paystack.shop/pay/Self_Funded',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200', 
    badge: 'bg-amber-600',
    benefits: ['Full access to training modules','Dedicated mentorship program','Business plan competition → Grant eligible','Lifetime Alumni Network access','Graduation ceremony attendance','₦20,000 Registration + ₦50,000 Program Fee'],
    notIncluded: ['Transportation to graduation ceremony','Accommodation during graduation'],
  },
];

type Category = typeof CATEGORIES[number];

const EMPTY_FORM = { fullName: '', email: '', phone: '', areaOfInterest: '', category: '' };

// ────────────────────────────────────────────────
// Countdown Timer - Enhanced Mobile Responsive
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
      <div className="bg-white/20 backdrop-blur-lg border border-white/40 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-3 sm:py-4 min-w-[55px] xs:min-w-[65px] sm:min-w-[80px] shadow-lg">
        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tabular-nums">
          {String(val).padStart(2, '0')}
        </div>
      </div>
      <div className="mt-1.5 sm:mt-2.5 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-white/95">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-5 flex-wrap px-2">
      <Unit val={time.days}    label="Days"    />
      <span className="text-xl sm:text-3xl md:text-4xl text-white/60 hidden xs:inline">:</span>
      <Unit val={time.hours}   label="Hours"   />
      <span className="text-xl sm:text-3xl md:text-4xl text-white/60 hidden xs:inline">:</span>
      <Unit val={time.minutes} label="Minutes" />
      <span className="text-xl sm:text-3xl md:text-4xl text-white/60 hidden xs:inline">:</span>
      <Unit val={time.seconds} label="Seconds" />
    </div>
  );
}

// ────────────────────────────────────────────────
// Benefits Carousel - Enhanced Mobile Responsive
// ────────────────────────────────────────────────
function BenefitsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % BENEFITS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (iconType: string) => {
    const iconProps = { className: "w-10 h-10 sm:w-12 md:w-14 lg:w-16 mx-auto mb-4 sm:mb-5 md:mb-6 text-amber-300" };
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
    <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-white overflow-hidden shadow-2xl my-12 sm:my-16 md:my-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-emerald-800/95" />
      
      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center px-2">
          Why Join FuturenTrepeneurship?
        </h2>

        <div className="relative min-h-[300px] xs:min-h-[320px] sm:min-h-[280px] md:min-h-[300px]">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                i === index ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95 pointer-events-none'
              }`}
            >
              <div className="text-center max-w-3xl mx-auto px-4">
                {getIcon(benefit.icon)}
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 px-2">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-white/95 px-2">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
          <button 
            onClick={() => setIndex(i => (i - 1 + BENEFITS.length) % BENEFITS.length)} 
            className="bg-white/20 hover:bg-white/30 p-2 sm:p-2.5 md:p-3 rounded-full transition backdrop-blur-sm border border-white/30" 
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            {BENEFITS.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setIndex(i)} 
                className={`h-2 sm:h-2.5 md:h-3 rounded-full transition-all ${
                  i === index ? 'w-6 sm:w-8 md:w-10 bg-white shadow-lg' : 'w-2 sm:w-2.5 md:w-3 bg-white/50'
                }`} 
                aria-label={`Slide ${i + 1}`} 
              />
            ))}
          </div>
          <button 
            onClick={() => setIndex(i => (i + 1) % BENEFITS.length)} 
            className="bg-white/20 hover:bg-white/30 p-2 sm:p-2.5 md:p-3 rounded-full transition backdrop-blur-sm border border-white/30" 
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Category Card - Enhanced Mobile Responsive
// ────────────────────────────────────────────────
function CategoryCard({ category, onSelect }: { category: Category; onSelect: () => void }) {
  return (
    <div className={`${category.color} border-2 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-7 transition-all duration-300 hover:shadow-2xl sm:hover:scale-[1.02] md:hover:scale-[1.03] sm:hover:-translate-y-1 md:hover:-translate-y-2 group flex flex-col h-full`}>
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between mb-4 sm:mb-5 gap-3 xs:gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors leading-tight break-words">
            {category.name}
          </h3>
          <span className={`inline-block ${category.badge} text-white text-[10px] xs:text-xs px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full font-semibold tracking-wide`}>
            {category.type}
          </span>
        </div>
        <div className="text-left xs:text-right flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap xs:justify-end">
            <p className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
              {category.price}
            </p>
          </div>
          <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 mt-1">
            {category.slots} slots
          </p>
        </div>
      </div>

      <div className="mb-4 sm:mb-5 md:mb-6 flex-1">
        <p className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base md:text-lg">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 mr-2 flex-shrink-0" /> 
          What's Included
        </p>
        <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
          {category.benefits.map((b, i) => (
            <li key={i} className="flex items-start">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600 mr-2 sm:mr-2.5 md:mr-3 mt-0.5 flex-shrink-0" />
              <span className="leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {category.notIncluded.length > 0 && (
        <div className="mb-4 sm:mb-5 md:mb-7">
          <p className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base md:text-lg">
            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500 mr-2 flex-shrink-0" /> 
            Not Included
          </p>
          <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 text-xs sm:text-sm md:text-base text-gray-600">
            {category.notIncluded.map((item, i) => (
              <li key={i} className="flex items-start">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 mr-2 sm:mr-2.5 md:mr-3 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onSelect}
        className="w-full mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:from-gray-800 hover:to-black transition-all shadow-lg hover:shadow-xl group-hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        Select & Register <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function FuturenTrepeneurship() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm]                 = useState(false);
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [errors, setErrors]                     = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [submitError, setSubmitError]           = useState('');

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

  // Fix for the handleSubmit function in your FuturenTrepeneurship component

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedCategory) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const newUniqueId = generateUniqueId();

      // Save registration to Firebase first
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

      console.log('✅ Registration saved, redirecting to payment...');

      // Build callback URL - where users land after payment
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      
      // ⭐ CRITICAL FIX: Include reference in callback URL
      const callbackUrl = `${baseUrl}/futurentrepreneurship26/payment-success?` +
        `reference=${encodeURIComponent(newUniqueId)}&` +  // ← THIS WAS MISSING!
        `status=success&` +
        `category=${encodeURIComponent(selectedCategory.id)}`;

      console.log('🔗 Callback URL:', callbackUrl);

      // Build payment URL
      const paymentUrl = new URL(selectedCategory.paymentLink);
      
      // User data
      paymentUrl.searchParams.append('email', formData.email);
      paymentUrl.searchParams.append('first_name', formData.fullName.split(' ')[0]);
      paymentUrl.searchParams.append('last_name', formData.fullName.split(' ').slice(1).join(' ') || '');
      paymentUrl.searchParams.append('phone', formData.phone);
      
      // Reference
      paymentUrl.searchParams.append('reference', newUniqueId);
      
      // ⭐ CRITICAL: Metadata for webhook (triggers email)
      paymentUrl.searchParams.append('metadata[registration_id]', newUniqueId);
      paymentUrl.searchParams.append('metadata[category]', selectedCategory.name);
      paymentUrl.searchParams.append('metadata[category_id]', selectedCategory.id);
      
      // ⭐ Callback URL - where user is redirected after payment
      paymentUrl.searchParams.append('callback_url', callbackUrl);

      console.log('💳 Redirecting to Paystack payment...');
      console.log('📧 Email will be triggered by webhook after successful payment');
      console.log('Full payment URL:', paymentUrl.toString());

      // Redirect to Paystack payment page
      window.location.href = paymentUrl.toString();
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setSubmitError('Registration failed. Please try again or contact support.');
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setShowForm(false);
    setSelectedCategory(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setSubmitError('');
  };

  // ─── REGISTRATION FORM ───────────────────────
  if (showForm && selectedCategory) {
    const fields = ['fullName', 'email', 'phone', 'areaOfInterest'] as const;

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-6 xs:py-8 sm:py-12 px-3 xs:px-4 sm:px-5">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setShowForm(false); setSelectedCategory(null); setSubmitError(''); }}
            className="mb-5 xs:mb-6 sm:mb-8 text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-2 transition hover:underline text-sm sm:text-base"
          >
            ← Back to Categories
          </button>

          <div className="bg-white/95 backdrop-blur-md rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl p-5 xs:p-6 sm:p-8 md:p-12 border border-gray-100/80">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2 xs:mb-3 sm:mb-4 leading-tight">
              Complete Your Registration
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-gray-700 mb-6 xs:mb-8 sm:mb-10">
              Selected plan: <strong className="text-emerald-700 font-bold break-words">{selectedCategory.name}</strong>
            </p>

            {submitError && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 sm:px-6 py-3 xs:py-4 sm:py-5 rounded-lg xs:rounded-xl sm:rounded-2xl mb-5 xs:mb-6 sm:mb-8 shadow-sm text-xs xs:text-sm sm:text-base">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 xs:space-y-6 sm:space-y-8">
              {fields.map(field => (
                <div key={field}>
                  <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} *
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full px-4 sm:px-6 py-3 xs:py-4 sm:py-5 border-2 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all focus:ring-4 focus:outline-none text-gray-900 text-sm xs:text-base sm:text-lg placeholder-gray-500 shadow-sm ${
                      errors[field]
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500 hover:border-emerald-400'
                    }`}
                    placeholder={
                      field === 'areaOfInterest'
                        ? 'e.g. Agriculture, Tech, Fashion…'
                        : ''
                    }
                  />
                  {errors[field] && (
                    <p className="mt-1.5 sm:mt-2 text-xs xs:text-sm sm:text-base text-red-600 font-medium">
                      {errors[field]}
                    </p>
                  )}
                </div>
              ))}

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg xs:rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-8 border border-emerald-200 shadow-inner mt-6 xs:mt-8 sm:mt-10">
                <p className="text-sm xs:text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                  Your Selected Plan
                </p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-black text-emerald-800 mb-2 sm:mb-3 break-words">
                  {selectedCategory.name}
                </p>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <p className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
                    {selectedCategory.price}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 xs:py-4 sm:py-5 md:py-6 rounded-lg xs:rounded-xl sm:rounded-2xl font-bold text-base xs:text-lg sm:text-xl transition-all shadow-2xl hover:shadow-3xl disabled:opacity-60 flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 animate-spin" /> 
                    Processing…
                  </>
                ) : (
                  <>Proceed to Payment →</>
                )}
              </button>

              <p className="text-[10px] xs:text-xs sm:text-sm text-center text-gray-500 mt-3 xs:mt-4 leading-relaxed">
                You will be redirected to Paystack to complete your secure payment.<br/>
                A confirmation email will be sent after successful payment.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LANDING PAGE ────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/40">
      {/* Hero – With Background Image */}
      <div className="relative text-white py-12 xs:py-16 sm:py-24 md:py-32 lg:py-48 px-3 xs:px-4 sm:px-5 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/90 to-blue-950/95" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 xs:mb-4 sm:mb-6 tracking-tighter bg-gradient-to-r from-teal-200 via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl leading-tight px-2">
            FuturenTrepeneurship
          </h1>
          <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-3 xs:mb-4 sm:mb-6 font-semibold text-teal-100 drop-shadow-lg px-2">
            NYSC Youth Empowerment & Entrepreneurship Program 2026
          </p>
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 xs:mb-8 sm:mb-12 text-white/90 max-w-4xl mx-auto px-4 leading-relaxed">
            Turn your idea into a funded reality with mentorship, training, grants & lifelong network.
          </p>

          <div className="inline-block bg-black/30 backdrop-blur-2xl rounded-xl xs:rounded-2xl sm:rounded-3xl px-4 xs:px-6 sm:px-10 py-3 xs:py-4 sm:py-6 mb-8 xs:mb-10 sm:mb-14 border border-white/20 shadow-2xl mx-4">
            <p className="text-xs xs:text-sm sm:text-lg md:text-xl uppercase tracking-widest font-bold mb-1 sm:mb-2 text-teal-200">
              Organized by
            </p>
            <p className="text-base xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              Quiet Shelter Empowerment Foundation
            </p>
          </div>

          <div className="mb-10 xs:mb-12 sm:mb-16 px-4">
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 xs:mb-4 sm:mb-6 animate-bounce-slow">
              Limited Slots – Register Before March 9, 2026!
            </p>
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-6 rounded-full font-extrabold text-base xs:text-lg sm:text-xl md:text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 ring-4 ring-amber-400/40 w-full sm:w-auto max-w-md"
            >
              Claim Your Spot Now <ArrowRight className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 md:w-10" />
            </a>
          </div>

          <div className="mb-6 xs:mb-8 sm:mb-12 px-2 xs:px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 xs:gap-4 sm:gap-6 mb-5 xs:mb-6 sm:mb-8">
              <Clock className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 animate-pulse" />
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center sm:text-left">
                Registration Closes In
              </h2>
            </div>
            <CountdownTimer targetDate="2026-03-09T23:59:59" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 py-10 xs:py-12 sm:py-16 md:py-20 lg:py-28">
        {/* Overview - Enhanced Mobile */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl p-5 xs:p-6 sm:p-8 md:p-12 lg:p-16 mb-10 xs:mb-12 sm:mb-16 md:mb-20 border border-gray-100/80">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-5 xs:mb-6 sm:mb-8 md:mb-10 text-center leading-tight px-2">
            Unlock Your Entrepreneurial Future
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-gray-700 leading-relaxed mb-5 xs:mb-6 sm:mb-8 md:mb-10 px-2">
            Empowering Nigerian youth — especially NYSC corps members — with world-class entrepreneurship training, mentorship, funding access and lifelong networking to build sustainable businesses.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-7 mb-5 xs:mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-start gap-3 xs:gap-4 sm:gap-5 p-4 xs:p-5 sm:p-6 bg-emerald-50 rounded-lg xs:rounded-xl sm:rounded-2xl border border-emerald-100">
              <BookOpen className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 text-base xs:text-lg sm:text-xl">
                  Hybrid Learning
                </h3>
                <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-snug">
                  Online platform + personalized in-person / virtual mentorship
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 xs:gap-4 sm:gap-5 p-4 xs:p-5 sm:p-6 bg-teal-50 rounded-lg xs:rounded-xl sm:rounded-2xl border border-teal-100">
              <TrendingUp className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 text-base xs:text-lg sm:text-xl">
                  Real Growth
                </h3>
                <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-snug">
                  Grants, seed funding, pitch competitions & powerful networking
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-4 xs:p-5 sm:p-7 rounded-r-lg xs:rounded-r-xl sm:rounded-r-2xl">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-emerald-600 flex-shrink-0" />
              <h3 className="font-bold text-gray-900 text-base xs:text-lg sm:text-xl">
                Registration Window
              </h3>
            </div>
            <p className="text-sm xs:text-base sm:text-lg text-gray-800 mb-1 xs:mb-1.5 sm:mb-2 font-semibold">
              Feb 10 – March 9, 2026
            </p>
            <p className="text-xs xs:text-sm sm:text-base text-gray-700">
              400 total slots • Cohort 1
            </p>
          </div>
        </section>

        <BenefitsCarousel />

        {/* Categories - Enhanced Mobile Grid */}
        <section id="categories" className="my-12 xs:my-16 sm:my-20 md:my-24 scroll-mt-20">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center text-gray-900 mb-8 xs:mb-10 sm:mb-12 md:mb-16 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent px-4 leading-tight">
            Choose Your Path to Success
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 xs:gap-6 sm:gap-8 md:gap-10">
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

        {/* Final CTA - With Background Image */}
        <div className="relative text-center my-10 xs:my-12 sm:my-16 md:my-20 rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden p-8 xs:p-10 sm:p-16 md:p-20 lg:p-24">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-900/90" />
          
          <div className="relative z-10 px-4">
            <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 xs:mb-6 sm:mb-8 drop-shadow-lg leading-tight">
              Ready to Build Your Future?
            </p>
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 xs:px-10 sm:px-12 md:px-16 py-4 xs:py-5 sm:py-6 md:py-8 rounded-full font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 ring-4 sm:ring-8 ring-amber-400/40 w-full sm:w-auto max-w-2xl"
            >
              Secure Your Registration Now <Sparkles className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 md:w-10 animate-pulse" />
            </a>
          </div>
        </div>

        {/* Partners - Enhanced Mobile */}
        <section className="bg-white rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-xl p-5 xs:p-6 sm:p-8 md:p-12 mb-10 xs:mb-12 sm:mb-16 border border-gray-100">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 xs:mb-8 sm:mb-10 md:mb-12 text-center">
            Our Partners
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 xs:gap-6 sm:gap-8">
            {[
              { icon: Award,      name: 'American University of Nigeria', desc: 'Business School' },
              { icon: TrendingUp, name: 'Doba Agri-Finance',             desc: 'Limited'         },
              { icon: Users,      name: 'Wisdom Shelter',                desc: 'Limited'         },
            ].map((p, i) => (
              <div key={i} className="text-center p-5 xs:p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200 hover:shadow-lg transition">
                <p.icon className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 text-emerald-600 mx-auto mb-3 xs:mb-4 sm:mb-5" />
                <h3 className="font-bold text-base xs:text-lg sm:text-xl text-gray-900 mb-1 xs:mb-1.5 sm:mb-2">
                  {p.name}
                </h3>
                <p className="text-xs xs:text-sm sm:text-base text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ - Enhanced Mobile */}
        <section className="bg-white rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-xl p-5 xs:p-6 sm:p-8 md:p-12 border border-gray-100">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 xs:mb-8 sm:mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 xs:space-y-4 sm:space-y-5">
            {[
              { q: 'Who can apply?',            a: 'All Nigerian youth, especially current and recent NYSC corps members.' },
              { q: 'Is the program free?',      a: 'We offer competitive fully-funded and partially-funded slots, plus affordable self-funded options.' },
              { q: 'When does training start?', a: 'Training begins shortly after registration closes (March 2026 cohort).' },
              { q: 'Will I receive funding?',   a: 'Top performers in the business plan competition are eligible for seed grants.' },
            ].map((item, i) => (
              <details key={i} className="group border border-gray-200 rounded-lg xs:rounded-xl">
                <summary className="flex justify-between items-center p-4 xs:p-5 sm:p-6 cursor-pointer font-semibold text-sm xs:text-base sm:text-lg text-gray-800 hover:text-emerald-700 transition list-none">
                  <span className="pr-3 xs:pr-4">{item.q}</span>
                  <ChevronDown className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 transition group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-4 xs:px-5 sm:px-6 pb-4 xs:pb-5 sm:pb-6 text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-br from-gray-950 to-black text-white py-8 xs:py-10 sm:py-12 md:py-16 px-3 xs:px-4 sm:px-5 mt-12 xs:mt-16 sm:mt-20 md:mt-24">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-400">
            © 2026 Quiet Shelter Empowerment Foundation (QuiSEF)
          </p>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 mt-2 xs:mt-3 sm:mt-4">
            Empowering Nigeria's Next Generation of Entrepreneurs
          </p>
        </div>
      </footer>
    </div>
  );
}