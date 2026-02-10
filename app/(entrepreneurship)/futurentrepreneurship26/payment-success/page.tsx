'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, ArrowRight, Mail, FileText, Calendar, X } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const categoryId = searchParams.get('category');

    if (!reference) {
      setError('No registration reference found');
      setLoading(false);
      return;
    }

    // Fetch registration data to display
    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/registrations?id=${encodeURIComponent(reference)}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch registration');
        }
        
        if (data.success && data.data) {
          setRegistrationData({
            ...data.data,
            categoryId: categoryId || data.data.category
          });
        } else {
          setError(data.error || 'Registration not found');
        }
      } catch (err) {
        console.error('Error fetching registration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load registration details');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 animate-spin text-emerald-600 mx-auto mb-6" />
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Confirming Your Payment...
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600">
            Please wait while we verify your registration
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl xs:rounded-3xl shadow-2xl p-6 xs:p-8 sm:p-10 text-center border border-red-200">
          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 text-red-600" />
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-base xs:text-lg sm:text-xl text-gray-600 mb-8">
            {error}
          </p>
          <a
            href="/futurentrepreneurship26"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const reference = searchParams.get('reference');
  const showPitchDeck = registrationData?.categoryId !== 'self-funded';

  const pitchDeckUrl = showPitchDeck ? 
    `/pitchdeck?id=${encodeURIComponent(reference || '')}` +
    `&name=${encodeURIComponent(registrationData?.fullName || '')}` +
    `&email=${encodeURIComponent(registrationData?.email || '')}` +
    `&category=${encodeURIComponent(registrationData?.categoryName || '')}` 
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-3 xs:p-4 sm:p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl xs:rounded-3xl shadow-2xl p-5 xs:p-6 sm:p-8 md:p-12 border border-gray-100">
        
        {/* Success Icon */}
        <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 xs:mb-8 animate-pulse shadow-xl">
          <Check className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 text-white" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 mb-3 xs:mb-4 text-center leading-tight">
          🎉 Payment Successful!
        </h1>
        
        <p className="text-base xs:text-lg sm:text-xl text-gray-600 mb-6 xs:mb-8 text-center px-2">
          Your registration for <strong className="text-emerald-700">FuturenTrepeneurship NYSC 2026</strong> is complete!
        </p>

        {/* Registration ID Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl sm:rounded-2xl p-6 xs:p-7 sm:p-8 mb-6 xs:mb-8 shadow-inner">
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 uppercase tracking-wider font-semibold text-center">
            Your Registration ID
          </p>
          <p className="text-3xl xs:text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 text-center break-all px-2">
            {reference}
          </p>
          <p className="text-xs xs:text-sm text-gray-600 mt-3 sm:mt-4 text-center">
            ⚠️ Save this ID - you'll need it for future reference
          </p>
        </div>

        {/* Registration Summary */}
        {registrationData && (
          <div className="bg-teal-50 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-7 mb-6 xs:mb-8 border border-teal-100">
            <h3 className="font-bold text-gray-900 mb-4 sm:mb-5 text-base xs:text-lg sm:text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 xs:w-6 xs:h-6" />
              Registration Summary
            </h3>
            <div className="space-y-3 sm:space-y-4 text-sm xs:text-base sm:text-lg text-gray-700">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="font-medium">Name:</span>
                <span className="font-semibold text-right break-words">{registrationData.fullName}</span>
              </div>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="font-medium">Email:</span>
                <span className="text-right break-all">{registrationData.email}</span>
              </div>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="font-medium">Category:</span>
                <span className="font-bold text-emerald-700 text-right">{registrationData.categoryName}</span>
              </div>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-black text-lg xs:text-xl sm:text-2xl text-gray-900">{registrationData.price}</span>
              </div>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="font-medium">Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4 xs:w-5 xs:h-5" /> CONFIRMED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Email Notification */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5 xs:p-6 mb-6 xs:mb-8">
          <div className="flex items-start gap-3 xs:gap-4">
            <Mail className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base xs:text-lg">
                📧 Check Your Email
              </h3>
              <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                A confirmation email with your registration details has been sent to{' '}
                <strong className="break-all">{registrationData?.email}</strong>.
                <br className="hidden xs:block" />
                <span className="block mt-2">
                  The email includes your Registration ID and important next steps.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps - Conditional */}
        {showPitchDeck ? (
          <div className="mb-6 xs:mb-8 space-y-4 xs:space-y-5">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-xl p-5 xs:p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base xs:text-lg sm:text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 xs:w-6 xs:h-6" />
                📊 Next Step: Submit Your Pitch Deck
              </h3>
              <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                To be eligible for the <strong>Business Plan Competition</strong> and funding opportunities, you must submit your pitch deck.
              </p>
              <a
                href={pitchDeckUrl}
                className="inline-flex items-center justify-center gap-2 xs:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg xs:rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl text-sm xs:text-base sm:text-lg w-full sm:w-auto"
              >
                Submit Pitch Deck Now <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="mb-6 xs:mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl p-5 xs:p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base xs:text-lg sm:text-xl">
                ✅ Self-Funded Track Activated
              </h3>
              <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                <strong>You have full access to all program benefits:</strong>
              </p>
              <ul className="space-y-2 text-xs xs:text-sm sm:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Complete training modules & curriculum</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Dedicated one-on-one mentorship</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Business plan competition eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Lifetime alumni network access</span>
                </li>
              </ul>
              <p className="text-xs xs:text-sm sm:text-base text-amber-900 font-semibold mt-4 bg-amber-100 p-3 rounded-lg">
                🎯 Your dedicated mentor will contact you after March 9, 2026
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 xs:gap-4">
          <a
            href="/"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg xs:rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg hover:shadow-xl text-center text-sm xs:text-base sm:text-lg"
          >
            Return to Home
          </a>
          {showPitchDeck && (
            <a
              href={pitchDeckUrl}
              className="flex-1 bg-blue-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg xs:rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm xs:text-base sm:text-lg"
            >
              Go to Pitch Deck <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
            </a>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 xs:mt-10 pt-6 xs:pt-8 border-t border-gray-200">
          <p className="text-xs xs:text-sm text-center text-gray-500 leading-relaxed">
            Need help? Contact us at{' '}
            <a href="mailto:support@quietshelter.org" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              support@quietshelter.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}