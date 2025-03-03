'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'Sexual and Gender-Based Violence (SGBV) - QuietShelter Empowerment Foundation',
  description: 'Explore QuietShelter’s holistic solutions to address Sexual and Gender-Based Violence (SGBV) in Nigeria.',
  openGraph: {
    title: 'Sexual and Gender-Based Violence (SGBV) - QuietShelter Empowerment Foundation',
    description: 'Explore QuietShelter’s holistic solutions to address Sexual and Gender-Based Violence (SGBV) in Nigeria.',
    url: 'https://your-domain.com/strategy/sgbv',
    images: ['/images/SGBV.jpeg'],
  },
};

export default function SGBVPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Sexual and Gender-Based Violence (SGBV) in Nigeria
          </h1>
        </div>
      </section>

      {/* Navigation Buttons (Top) */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/education"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/wash"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          The SGBV Crisis in Nigeria
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Sexual and Gender-Based Violence (SGBV) is an entrenched issue in Nigeria, particularly in conflict-affected
          northern regions. The Boko Haram insurgency, floods, and other crises have exacerbated domestic violence,
          forced early marriages, and sexual exploitation. Vulnerable groups like women and children, especially in IDP
          camps, are heavily affected.
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/SGBV.jpeg"
            alt="SGBV Crisis in Nigeria"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation's Holistic Solution to Address SGBV
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Community-Wide Sensitization and Awareness Campaign',
              items: [
                { label: 'Target Audience', text: 'Community leaders, youth groups, women’s groups.' },
                { label: 'Goal', text: 'Raise awareness about GBV and equip communities to address the issue.' },
                { label: 'Approach', text: 'Conduct workshops and public awareness campaigns, involving local leaders in the fight against GBV.' },
              ],
            },
            {
              title: 'Victim-Centered Community-Based Response Mechanism',
              items: [
                { label: 'Goal', text: 'Ensure survivors receive comprehensive support, protection, and justice.' },
                { label: 'Key Actors', text: 'Police, healthcare providers, legal professionals, psychologists.' },
                { label: 'Approach', text: 'Create a community-based referral system and confidential reporting channels.' },
              ],
            },
            {
              title: 'Justice, Rehabilitation, and Psychosocial Support',
              items: [
                { label: 'Goal', text: 'Hold perpetrators accountable, ensure survivor rehabilitation, and prevent further cases of GBV.' },
                { label: 'Approach', text: 'Collaboration with law enforcement, provision of medical care, psychosocial support, and economic empowerment programs.' },
              ],
            },
            {
              title: 'Prevention Strategies and Community-Led Advocacy',
              items: [
                { label: 'Goal', text: 'Build resilient communities that prevent GBV.' },
                { label: 'Approach', text: 'Engage men and boys, promote gender equality, and offer livelihoods for at-risk groups.' },
              ],
            },
            {
              title: 'Monitoring, Evaluation, and Sustainability',
              items: [
                { label: 'Goal', text: 'Ensure the effectiveness and sustainability of interventions.' },
                { label: 'Approach', text: 'Data collection, feedback loops, and community ownership of initiatives.' },
              ],
            },
          ].map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{section.title}</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-base sm:text-lg leading-relaxed">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <span className="font-medium">{item.label}:</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Bottom) */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/education"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/wash"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Scroll to Top Arrow */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} size="lg" />
        </button>
      )}
    </main>
  );
}