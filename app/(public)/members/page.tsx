'use client';

import { useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import {
  PERSONAL_TIERS,
  ORGANIZATION_TIERS,
  getPaystackLink,
  getTierByValue,
  MembershipTier,
} from '@/components/membership/config';

// Types
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
  tierAmount: number; // Amount in Naira
  declaration: boolean;
  paymentStatus: string;
  submittedAt: ReturnType<typeof serverTimestamp>;
  orgName?: string;
  orgType?: string;
  contactPerson?: string;
  // New fields for tracking
  paymentId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  paidAt?: Date;
  amountPaid?: number;
  failureReason?: string;
}

// Membership Tier Card Component
interface MembershipTierCardProps {
  tier: MembershipTier;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const MembershipTierCard = ({ tier, isSelected, onSelect }: MembershipTierCardProps) => {
  return (
    <div
      className={`bg-gray-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-600' : ''
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-800">{tier.title}</h3>
      <p className="text-blue-600 text-xl font-bold my-2">{tier.price}</p>
      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
        {tier.benefits.map((benefit, i) => (
          <li key={i}>{benefit}</li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-center">
        <input
          type="radio"
          name="membershipTier"
          value={tier.value}
          id={`${tier.value}Tier`}
          className="mr-2 cursor-pointer"
          required
          onChange={(e) => onSelect(e.target.value)}
          checked={isSelected}
        />
        <label htmlFor={`${tier.value}Tier`} className="text-gray-700 text-sm cursor-pointer">
          Select
        </label>
      </div>
    </div>
  );
};

// Personal Form Component
interface PersonalFormProps {
  onTierSelect: (tier: string) => void;
  selectedTier: string | null;
}

const PersonalForm = ({ onTierSelect, selectedTier }: PersonalFormProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-gray-700 font-medium">
            First Name*
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="middleName" className="block text-gray-700 font-medium">
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-gray-700 font-medium">
            Last Name*
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="gender" className="block text-gray-700 font-medium">
            Gender*
          </label>
          <select
            id="gender"
            name="gender"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="personalEmail" className="block text-gray-700 font-medium">
            Email*
          </label>
          <input
            type="email"
            id="personalEmail"
            name="personalEmail"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="personalPhone" className="block text-gray-700 font-medium">
            Phone*
          </label>
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
        <label htmlFor="personalAddress" className="block text-gray-700 font-medium">
          Address*
        </label>
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
          {PERSONAL_TIERS.map((tier) => (
            <MembershipTierCard
              key={tier.value}
              tier={tier}
              isSelected={selectedTier === tier.value}
              onSelect={onTierSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Organization Form Component
interface OrganizationFormProps {
  onTierSelect: (tier: string) => void;
  selectedTier: string | null;
}

const OrganizationForm = ({ onTierSelect, selectedTier }: OrganizationFormProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Organization Information</h2>
      <div className="space-y-2">
        <label htmlFor="orgName" className="block text-gray-700 font-medium">
          Organization Name*
        </label>
        <input
          type="text"
          id="orgName"
          name="orgName"
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="orgType" className="block text-gray-700 font-medium">
          Organization Type*
        </label>
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
          <label htmlFor="contactPerson" className="block text-gray-700 font-medium">
            Contact Person*
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="orgPhone" className="block text-gray-700 font-medium">
            Phone*
          </label>
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
          <label htmlFor="orgEmail" className="block text-gray-700 font-medium">
            Email*
          </label>
          <input
            type="email"
            id="orgEmail"
            name="orgEmail"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="orgAddress" className="block text-gray-700 font-medium">
            Organization Address*
          </label>
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
          {ORGANIZATION_TIERS.map((tier) => (
            <MembershipTierCard
              key={tier.value}
              tier={tier}
              isSelected={selectedTier === tier.value}
              onSelect={onTierSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Membership Page Component
export default function MembershipPage() {
  const [formType, setFormType] = useState<'personal' | 'organization'>('personal');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDownloadPDF = () => {
    const pdfUrl = '/docs/membership-form.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Quietshelter-membership-form.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSwitch = (type: 'personal' | 'organization') => {
    setFormType(type);
    setResponseMessage('');
    setSelectedTier(null);
    if (formRef.current) formRef.current.reset();
  };

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
  };

  const prepareFormData = (formElement: HTMLFormElement): FormData => {
    const formData = new FormData(formElement);
    const tierValue = formData.get('membershipTier') as string;
    const tier = getTierByValue(tierValue);
    
    let data: FormData;

    if (formType === 'personal') {
      data = {
        type: 'personal',
        firstName: formData.get('firstName') as string,
        middleName: (formData.get('middleName') as string) || '',
        lastName: formData.get('lastName') as string,
        gender: formData.get('gender') as string,
        email: formData.get('personalEmail') as string,
        phone: formData.get('personalPhone') as string,
        address: formData.get('personalAddress') as string,
        membershipTier: tierValue,
        tierAmount: tier?.priceValue || 0,
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
        membershipTier: tierValue,
        tierAmount: tier?.priceValue || 0,
        declaration: formData.get('declaration') === 'on',
        paymentStatus: 'pending',
        submittedAt: serverTimestamp(),
      };
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const data = prepareFormData(e.target as HTMLFormElement);

    try {
      // Save application to Firebase
      const docRef = await addDoc(collection(db, 'membershipApplications'), data);

      // Handle student tier (free)
      if (data.membershipTier === 'student') {
        setResponseMessage(
          'Student membership application completed successfully! No payment required.'
        );
        if (formRef.current) formRef.current.reset();
        setIsSubmitting(false);
        setSelectedTier(null);
      } else {
        // Get Paystack link from config
        const paystackLink = getPaystackLink(data.membershipTier);

        if (paystackLink) {
          // Add metadata to track the application
          const linkWithMetadata = `${paystackLink}?metadata=${encodeURIComponent(
            JSON.stringify({
              applicationId: docRef.id,
              email: data.email,
              membershipTier: data.membershipTier,
              tierAmount: data.tierAmount,
            })
          )}`;

          setResponseMessage('Redirecting to payment page...');

          // Small delay to show the message
          setTimeout(() => {
            window.location.href = linkWithMetadata;
          }, 1000);
        } else {
          setResponseMessage(
            'Payment link not configured for this membership tier. Please contact support.'
          );
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Error submitting membership application:', error);
      setResponseMessage('Error submitting application. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Membership Application</h1>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span className="hidden md:inline">Download Paper Form</span>
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Join us in creating impactful change! By becoming a member of the Quiet Shelter
          Foundation, you contribute to our mission of addressing critical humanitarian issues.
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleFormSwitch('personal')}
            className={`px-6 py-2 rounded-full font-medium text-base md:text-lg transition-all duration-300 ${
              formType === 'personal'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => handleFormSwitch('organization')}
            className={`px-6 py-2 rounded-full font-medium text-base md:text-lg transition-all duration-300 ${
              formType === 'organization'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Organization
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {formType === 'personal' ? (
            <PersonalForm onTierSelect={handleTierSelect} selectedTier={selectedTier} />
          ) : (
            <OrganizationForm onTierSelect={handleTierSelect} selectedTier={selectedTier} />
          )}

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Declaration</h2>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="declaration"
                id="declaration"
                required
                className="mt-1"
              />
              <span className="text-gray-700 text-sm md:text-base">
                I declare that all the information provided is accurate and agree to abide by the
                foundation's policies and guidelines.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Submit Application & Proceed to Payment'}
          </button>

          {responseMessage && (
            <div
              className={`p-4 rounded-md ${
                responseMessage.includes('Error') || responseMessage.includes('not configured')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              <p className="text-center">{responseMessage}</p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}