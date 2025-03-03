'use client';

import { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import dynamic from 'next/dynamic';

// Dynamically import PaystackPop with ssr: false
const PaystackPop = dynamic(
  () => import('@paystack/inline-js'),
  { ssr: false }
);

// Payment Modal Component
interface PaymentModalProps {
  applicationId: string;
  tier: 'student' | 'basic' | 'professional' | 'corporate';
  email: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

const PaymentModal = ({ applicationId, tier, email, onSuccess, onCancel }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'paypal' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const tierPrices = {
    student: 0,
    basic: 50000, // In kobo
    professional: 200000,
    corporate: 500000,
  };

  const handlePaystackPayment = async () => {
    // Only execute on client side
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import the Paystack script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Once script is loaded, initialize Paystack
        const paystack = window.PaystackPop;
        const handler = paystack.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          email: email,
          amount: tierPrices[tier],
          ref: `mem_${Date.now()}`,
          onSuccess: async (response) => {
            try {
              await updateDoc(doc(db, 'membershipApplications', applicationId), {
                paymentStatus: 'completed',
                paymentId: response.reference,
                paymentMethod: 'paystack',
              });
              onSuccess(response.reference);
            } catch (error) {
              setPaymentError('Error updating payment status with Paystack');
              console.error('Paystack payment error:', error);
            }
          },
          onClose: () => {
            setPaymentError('Payment was cancelled or closed.');
            onCancel();
          },
        });
        
        handler.openIframe();
      } catch (error) {
        console.error('Error loading Paystack:', error);
        setPaymentError('Failed to load payment gateway');
      }
    }
  };
  const handlePaypalPayment = (data: Record<string, unknown>, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'NGN',
            value: (tierPrices[tier] / 100).toString(), // Convert kobo to NGN
          },
        },
      ],
    });
  };

  const handlePaypalApprove = async (data: Record<string, unknown>, actions: any) => {
    try {
      const details = await actions.order.capture();
      await updateDoc(doc(db, 'membershipApplications', applicationId), {
        paymentStatus: 'completed',
        paymentId: details.id,
        paymentMethod: 'paypal',
      });
      onSuccess(details.id);
    } catch (error) {
      setPaymentError('Error updating payment status with PayPal');
      console.error('PayPal payment error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 sm:p-8 rounded-xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Complete Your Payment</h2>
        <p className="text-center text-gray-600 mb-6">
          {tier === 'basic' && 'Basic Membership: ₦50,000'}
          {tier === 'professional' && 'Professional Membership: ₦200,000'}
          {tier === 'corporate' && 'Corporate Membership: ₦500,000'}
        </p>

        {!paymentMethod ? (
          <div className="space-y-4">
            <button
              onClick={() => setPaymentMethod('paystack')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md"
            >
              Pay with Paystack
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md"
            >
              Pay with PayPal
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-md transition-all duration-300 mt-2"
            >
              Cancel
            </button>
          </div>
        ) : paymentMethod === 'paystack' ? (
          <>
            <div className="mb-4">
              <button
                onClick={handlePaystackPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md"
              >
                Pay ₦{tierPrices[tier] / 100}
              </button>
            </div>
            <button
              onClick={() => setPaymentMethod(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition-all duration-300"
            >
              Back
            </button>
            {paymentError && <p className="text-red-600 text-center mt-4">{paymentError}</p>}
          </>
        ) : (
          <>
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' }}>
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={handlePaypalPayment}
                onApprove={handlePaypalApprove}
                onError={() => setPaymentError('An error occurred with PayPal payment')}
                onCancel={() => setPaymentMethod(null)}
              />
            </PayPalScriptProvider>
            <button
              onClick={() => setPaymentMethod(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition-all duration-300 mt-4"
            >
              Back
            </button>
            {paymentError && <p className="text-red-600 text-center mt-4">{paymentError}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default function MembershipPage() {
  const [formType, setFormType] = useState<'personal' | 'organization'>('personal');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<'student' | 'basic' | 'professional' | 'corporate' | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  interface FormData {
    type: 'personal' | 'organization';
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender?: string;
    email: string;
    phone: string;
    address: string;
    membershipTier: string;
    declaration: boolean;
    paymentStatus: string;
    submittedAt: ReturnType<typeof serverTimestamp>;
    orgName?: string;
    orgType?: string;
    contactPerson?: string;
  }

  const [formData, setFormData] = useState<FormData | null>(null);

  // Add Paystack script to document head using useEffect for client-side only execution
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleDownloadPDF = () => {
    const pdfUrl = '/pdf/membership-form.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'quietshelter-membership-form.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSwitch = (type: 'personal' | 'organization') => {
    setFormType(type);
    setResponseMessage('');
    setShowPayment(false);
    setApplicationId(null);
    setSelectedTier(null);
    setEmail(null);
    if (formRef.current) formRef.current.reset();
  };

  const prepareFormData = (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement);
    let data: FormData;

    if (formType === 'personal') {
      data = {
        type: 'personal',
        firstName: formData.get('firstName') as string,
        middleName: formData.get('middleName') as string || '',
        lastName: formData.get('lastName') as string,
        gender: formData.get('gender') as string,
        email: formData.get('personalEmail') as string,
        phone: formData.get('personalPhone') as string,
        address: formData.get('personalAddress') as string,
        membershipTier: formData.get('membershipTier') as string,
        declaration: formData.get('declaration') === 'on',
        paymentStatus: 'pending',
        submittedAt: serverTimestamp(),
      };
      setEmail(data.email);
    } else {
      data = {
        type: 'organization',
        orgName: formData.get('orgName') as string,
        orgType: formData.get('orgType') as string,
        contactPerson: formData.get('contactPerson') as string,
        phone: formData.get('orgPhone') as string,
        email: formData.get('orgEmail') as string,
        address: formData.get('orgAddress') as string,
        membershipTier: formData.get('membershipTier') as string,
        declaration: formData.get('declaration') === 'on',
        paymentStatus: 'pending',
        submittedAt: serverTimestamp(),
      };
      setEmail(data.email);
    }

    setSelectedTier(data.membershipTier as 'student' | 'basic' | 'professional' | 'corporate');
    return data;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const data = prepareFormData(e.target as HTMLFormElement);
    setFormData(data);

    try {
      const docRef = await addDoc(collection(db, 'membershipApplications'), data);
      setApplicationId(docRef.id);

      if (data.membershipTier === 'student') {
        await updateDoc(doc(db, 'membershipApplications', docRef.id), {
          paymentStatus: 'completed',
          paymentId: 'free-tier',
          paymentMethod: 'none',
        });
        setResponseMessage('Student membership application completed successfully! No payment required.');
        if (formRef.current) formRef.current.reset();
        setIsSubmitting(false);
      } else {
        setResponseMessage('Application submitted! Please complete payment to finalize your membership.');
        setShowPayment(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting membership application:', error);
      setResponseMessage('Error submitting application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setResponseMessage('Payment successful! Your membership application is now complete.');
    setShowPayment(false);
    setIsSubmitting(false);
    if (formRef.current) formRef.current.reset();
  };

  const handlePaymentCancel = () => {
    setResponseMessage('Application saved! You can complete payment later.');
    setShowPayment(false);
    setIsSubmitting(false);
  };

  return (
    <main className="container mx-auto bg-white py-12 px-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0 text-blue-600">Membership Application</h1>
        <button
          onClick={handleDownloadPDF}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 flex items-center self-start"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download Paper Form
        </button>
      </div>

      <p className="text-base md:text-lg mb-6 text-gray-700">
        Join us in creating impactful change! By becoming a member of the Quiet Shelter Foundation, you contribute to our mission of addressing critical humanitarian issues.
      </p>

      <form ref={formRef} id="membershipForm" onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => handleFormSwitch('personal')}
            className={`px-6 py-2 rounded-full font-medium text-base md:text-lg transition-all duration-300 ${
              formType === 'personal' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => handleFormSwitch('organization')}
            className={`px-6 py-2 rounded-full font-medium text-base md:text-lg transition-all duration-300 ${
              formType === 'organization' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Organization
          </button>
        </div>

        {formType === 'personal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-gray-700 font-medium">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="middleName" className="block text-gray-700 font-medium">Middle Name</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-gray-700 font-medium">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">Gender*</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input type="radio" name="gender" value="male" required className="mr-2" /> Male
                </label>
                <label className="flex items-center">
                  <input type="radio" name="gender" value="female" required className="mr-2" /> Female
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="personalEmail" className="block text-gray-700 font-medium">Email*</label>
                <input
                  type="email"
                  id="personalEmail"
                  name="personalEmail"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="personalPhone" className="block text-gray-700 font-medium">Phone*</label>
                <input
                  type="tel"
                  id="personalPhone"
                  name="personalPhone"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="personalAddress" className="block text-gray-700 font-medium">Address*</label>
              <textarea
                id="personalAddress"
                name="personalAddress"
                rows={3}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 resize-none"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Membership Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { title: 'Student', price: 'Free', benefits: ['Access to educational resources', 'Networking opportunities'], value: 'student' },
                  { title: 'Basic', price: '₦50,000', benefits: ['Discounted events', 'Resource access', 'Newsletters'], value: 'basic' },
                  { title: 'Professional', price: '₦200,000', benefits: ['Free access to events', 'Premium content', 'Advanced training', 'Mentorship'], value: 'professional' },
                ].map((tier) => (
                  <div key={tier.value} className="bg-gray-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-gray-800">{tier.title}</h3>
                    <p className="text-blue-600 text-xl font-bold my-2">{tier.price}</p>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-center">
                      <input type="radio" name="membershipTier" value={tier.value} id={`${tier.value}Tier`} className="mr-2" required />
                      <label htmlFor={`${tier.value}Tier`} className="text-gray-700 text-sm">Select</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {formType === 'organization' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Organization Information</h2>
            <div className="space-y-2">
              <label htmlFor="orgName" className="block text-gray-700 font-medium">Organization Name*</label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="orgType" className="block text-gray-700 font-medium">Organization Type*</label>
              <select
                id="orgType"
                name="orgType"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">Select Type</option>
                <option value="ngo">NGO</option>
                <option value="corporate">Corporate</option>
                <option value="government">Government</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="contactPerson" className="block text-gray-700 font-medium">Contact Person*</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="orgPhone" className="block text-gray-700 font-medium">Phone*</label>
                <input
                  type="tel"
                  id="orgPhone"
                  name="orgPhone"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="orgEmail" className="block text-gray-700 font-medium">Email*</label>
                <input
                  type="email"
                  id="orgEmail"
                  name="orgEmail"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="orgAddress" className="block text-gray-700 font-medium">Organization Address*</label>
                <textarea
                  id="orgAddress"
                  name="orgAddress"
                  rows={3}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Membership Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'Professional', price: '₦200,000', benefits: ['Free access to events', 'Premium content', 'Advanced training', 'Mentorship'], value: 'professional' },
                  { title: 'Corporate', price: '₦500,000', benefits: ['Free access to events', 'Tailored support', 'Sponsorship opportunities', 'Co-branding benefits'], value: 'corporate' },
                ].map((tier) => (
                  <div key={tier.value} className="bg-gray-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-gray-800">{tier.title}</h3>
                    <p className="text-blue-600 text-xl font-bold my-2">{tier.price}</p>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-center">
                      <input type="radio" name="membershipTier" value={tier.value} id={`${tier.value}Tier`} className="mr-2" required />
                      <label htmlFor={`${tier.value}Tier`} className="text-gray-700 text-sm">Select</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Declaration</h2>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="declaration" id="declaration" required className="mt-1" />
            <span className="text-gray-700 text-sm md:text-base">
              I declare that all the information provided is accurate and agree to abide by the foundation's policies and guidelines.
            </span>
          </label>
        </div>

        {!showPayment && (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Submit Application'}
          </button>
        )}

        {responseMessage && (
          <div className={`p-4 rounded-md ${responseMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <p className="text-center">{responseMessage}</p>
          </div>
        )}
      </form>

      {showPayment && applicationId && selectedTier && email && (
        <PaymentModal
          applicationId={applicationId}
          tier={selectedTier}
          email={email}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </main>
  );
}