'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const metadata: Metadata = {
  title: 'Membership - QuietShelter Empowerment Foundation',
  description: 'Join QuietShelter Empowerment Foundation as a member to support our mission of creating impactful change.',
};

const PaymentModal: React.FC<{ applicationId: string; tier: string; email: string; onSuccess: () => void }> = ({
  applicationId,
  tier,
  email,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'paypal' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const tierPrices: { [key: string]: number } = {
    student: 0, // Free tier
    basic: 50000, // ₦50,000 in kobo
    professional: 200000, // ₦200,000 in kobo
    corporate: 500000, // ₦500,000 in kobo
  };

  // Paystack Integration
  const paystackConfig = {
    reference: `mem_${Date.now()}`,
    email,
    amount: tierPrices[tier],
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  const handlePaystackPayment = () => {
    initializePaystackPayment(
      async (response: any) => {
        try {
          await updateDoc(doc(db, 'membershipApplications', applicationId), {
            paymentStatus: 'completed',
            paymentId: response.reference,
            paymentMethod: 'paystack',
          });
          handlePaymentSuccess(response.reference);
        } catch (error) {
          setPaymentError('Error updating payment status with Paystack');
          console.error('Paystack payment error:', error);
        }
      },
      () => {
        setPaymentError('Paystack payment was cancelled or failed');
      }
    );
  };

  // PayPal Integration
  const handlePaypalPayment = (data: any, actions: any) => {
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

  const handlePaypalApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      await updateDoc(doc(db, 'membershipApplications', applicationId), {
        paymentStatus: 'completed',
        paymentId: details.id,
        paymentMethod: 'paypal',
      });
      handlePaymentSuccess(details.id);
    } catch (error) {
      setPaymentError('Error updating payment status with PayPal');
      console.error('PayPal payment error:', error);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 sm:p-8 rounded-xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Complete Your Payment</h2>
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
          </div>
        ) : paymentMethod === 'paystack' ? (
          <>
            <PaystackButton
              {...paystackConfig}
              text={`Pay ₦${tierPrices[tier] / 100}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md"
              onSuccess={handlePaystackPayment}
              onClose={() => setPaymentError('Payment cancelled')}
            />
            {paymentError && <p className="text-red-600 text-center mt-4">{paymentError}</p>}
          </>
        ) : (
          <PayPalScriptProvider options={{ 'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' }}>
            <PayPalButtons
              style={{ layout: 'vertical' }}
              createOrder={handlePaypalPayment}
              onApprove={handlePaypalApprove}
              onError={() => setPaymentError('An error occurred with PayPal payment')}
            />
            {paymentError && <p className="text-red-600 text-center mt-4">{paymentError}</p>}
          </PayPalScriptProvider>
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
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const handleFormSwitch = (type: 'personal' | 'organization') => {
    setFormType(type);
    setResponseMessage('');
    setShowPayment(false);
    setApplicationId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const formData = new FormData(e.currentTarget);
    let data: any;

    if (formType === 'personal') {
      data = {
        type: 'personal',
        firstName: formData.get('firstName') as string,
        middleName: formData.get('middleName') as string,
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
    }

    try {
      const docRef = await addDoc(collection(db, 'membershipApplications'), data);
      console.log('Membership application submitted with ID:', docRef.id);

      if (data.membershipTier === 'student') {
        // Free tier: complete immediately without payment
        await updateDoc(doc(db, 'membershipApplications', docRef.id), {
          paymentStatus: 'completed',
          paymentId: 'free-tier',
          paymentMethod: 'none',
        });
        setResponseMessage('Membership application completed successfully!');
        setIsSubmitting(false);
      } else {
        // Paid tier: trigger payment modal
        setResponseMessage('Application saved! Please complete payment.');
        setApplicationId(docRef.id);
        setSelectedTier(data.membershipTier);
        setEmail(data.email);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Error submitting membership application:', error);
      setResponseMessage('Error submitting application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setResponseMessage('Membership application and payment completed successfully!');
    setShowPayment(false);
    setIsSubmitting(false);
  };

  const handleDownloadPDF = () => {
    const pdfUrl = '/pdf/membership-form.pdf'; // Placeholder; replace with real file in public/
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'membership-form.pdf';
    link.click();
  };

  return (
    <main className="container mx-auto bg-white py-12 px-6 max-w-6xl">
      <button
        onClick={handleDownloadPDF}
        className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 flex items-center"
      >
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        Download Form (PDF)
      </button>

      <form id="membershipForm" onSubmit={handleSubmit} className="space-y-8">
        <div className="form-section">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-600">Membership Application Form</h1>
          <p className="text-base md:text-lg mb-6 text-gray-700">
            Join us in creating impactful change! By becoming a member of the Quiet Shelter Foundation, you contribute to our mission of addressing critical humanitarian issues.
          </p>

          {/* Form Type Selector */}
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

          {/* Personal Form Section */}
          <div className={`${formType === 'personal' ? 'block' : 'hidden'} space-y-6`}>
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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Declaration</h2>
              <label className="flex items-start gap-2">
                <input type="checkbox" name="declaration" id="declaration" required className="mt-1" />
                <span className="text-gray-700 text-sm md:text-base">
                  I declare that all the information provided is accurate and agree to abide by the foundation's policies and guidelines.
                </span>
              </label>
            </div>
          </div>

          {/* Organization Form Section */}
          <div className={`${formType === 'organization' ? 'block' : 'hidden'} space-y-6`}>
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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Declaration</h2>
              <label className="flex items-start gap-2">
                <input type="checkbox" name="declaration" id="declaration" required className="mt-1" />
                <span className="text-gray-700 text-sm md:text-base">
                  I declare that all the information provided is accurate and agree to abide by the foundation's policies and guidelines.
                </span>
              </label>
            </div>
          </div>

          {!showPayment && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
          {responseMessage && (
            <p
              className={`text-center text-sm md:text-base ${
                responseMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {responseMessage}
            </p>
          )}
        </div>
      </form>

      {/* Payment Modal */}
      {showPayment && applicationId && selectedTier && email && (
        <PaymentModal applicationId={applicationId} tier={selectedTier} email={email} onSuccess={handlePaymentSuccess} />
      )}
    </main>
  );
}