// Membership Configuration File
// Update your Paystack checkout links here

export interface MembershipTier {
  title: string;
  price: string;
  priceValue: number; // in kobo for Paystack
  benefits: string[];
  value: 'student' | 'basic' | 'professional' | 'corporate';
  paystackLink?: string;
}

// Personal Membership Tiers
export const PERSONAL_TIERS: MembershipTier[] = [
  {
    title: 'Student',
    price: 'Free',
    priceValue: 0,
    benefits: [
      'Access to educational resources',
      'Networking opportunities',
    ],
    value: 'student',
    paystackLink: '', // No payment needed for student
  },
  {
    title: 'Basic',
    price: '₦50,000',
    priceValue: 50000,
    benefits: [
      'Discounted events',
      'Resource access',
      'Newsletters',
    ],
    value: 'basic',
    // Replace with your actual Paystack Payment Page link
    paystackLink: 'https://paystack.shop/pay/basic_membership',
  },
  {
    title: 'Professional',
    price: '₦200,000',
    priceValue: 200000,
    benefits: [
      'Free access to events',
      'Premium content',
      'Advanced training',
      'Mentorship',
    ],
    value: 'professional',
    // Replace with your actual Paystack Payment Page link
    paystackLink: 'https://paystack.shop/pay/Professional_Partner',
  },
];

// Organization Membership Tiers
export const ORGANIZATION_TIERS: MembershipTier[] = [
  {
    title: 'Professional',
    price: '₦200,000',
    priceValue: 200000,
    benefits: [
      'Free access to events',
      'Premium content',
      'Advanced training',
      'Mentorship',
    ],
    value: 'professional',
    // Replace with your actual Paystack Payment Page link
    paystackLink: 'https://paystack.com/pay/quietshelter-org-professional',
  },
  {
    title: 'Corporate',
    price: '₦500,000',
    priceValue: 500000,
    benefits: [
      'Free access to events',
      'Tailored support',
      'Sponsorship opportunities',
      'Co-branding benefits',
    ],
    value: 'corporate',
    // Replace with your actual Paystack Payment Page link
    paystackLink: 'https://paystack.shop/pay/cooperate_membershp',
  },
];

// Helper function to get all tiers
export const getAllTiers = (): MembershipTier[] => {
  return [...PERSONAL_TIERS, ...ORGANIZATION_TIERS];
};

// Helper function to get tier by value
export const getTierByValue = (value: string): MembershipTier | undefined => {
  return getAllTiers().find((tier) => tier.value === value);
};

// Helper function to get Paystack link for a tier
export const getPaystackLink = (tierValue: string): string => {
  const tier = getTierByValue(tierValue);
  return tier?.paystackLink || '';
};