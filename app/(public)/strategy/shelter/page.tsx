'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'Shelter and Infrastructure - QuietShelter Empowerment Foundation',
  description: 'Discover QuietShelter’s sustainable solutions to address shelter and infrastructure challenges in Nigeria.',
  openGraph: {
    title: 'Shelter and Infrastructure - QuietShelter Empowerment Foundation',
    description: 'Discover QuietShelter’s sustainable solutions to address shelter and infrastructure challenges in Nigeria.',
    url: 'https://your-domain.com/strategy/shelter',
    images: ['/images/fen.jpg'],
  },
};

export default function ShelterPage() {
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
      <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Shelter and Infrastructure Challenges in Nigeria
          </h1>
        </div>
      </section>

      {/* Navigation Buttons (Top) */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/wash"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/agriculture"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Impact of Shelter and Infrastructure Challenges in Nigeria
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Underdevelopment, poverty, insecurity, and natural disasters have significantly impacted Nigeria's shelter and
          infrastructure. Many families remain homeless, vital community facilities have been destroyed, and millions
          face increased vulnerability to violence, exploitation, and drug abuse. Children, girls, youths, and women are
          disproportionately affected by these conditions.
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/fen.jpg"
            alt="Shelter and Infrastructure Crisis in Nigeria"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation's Sustainable Solution to Address Shelter and Infrastructure Challenges
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Temporary Shelters for Disaster Management',
              items: [
                { label: 'Mobile and Modular Shelters', text: 'Develop durable, rapidly deployable shelters with renewable energy facilities for disaster-affected communities.' },
                { label: 'Disaster-Ready Communities', text: 'Designate high-risk areas for setting up temporary shelters and train communities on disaster preparedness.' },
              ],
            },
            {
              title: 'Victim Recovery and Rehabilitation Centers (Safe Spaces)',
              items: [
                { label: 'Safe Spaces for Vulnerable Populations', text: 'Build secure spaces providing emotional support, legal services, and vocational training for at-risk groups.' },
                { label: 'Psycho-Social Support', text: 'Incorporate counseling and recovery programs in shelters to aid victims of disasters and violence.' },
              ],
            },
            {
              title: 'Provision of Basic Amenities',
              items: [
                { label: 'Clean Water Supply', text: 'Install solar-powered boreholes in shelters to ensure access to clean drinking water.' },
                { label: 'Sanitation Facilities', text: 'Create gender-sensitive toilets, latrines, and showers for displaced communities.' },
                { label: 'Waste Management', text: 'Implement efficient waste disposal systems to maintain hygiene in camps and shelters.' },
              ],
            },
            {
              title: 'Agricultural Infrastructure Development',
              items: [
                { label: 'Irrigation Systems', text: 'Build irrigation facilities to boost agricultural production, particularly for IDP communities.' },
                { label: 'Storage Facilities', text: 'Establish modern cold storage units and warehouses for agricultural products to reduce post-harvest losses.' },
              ],
            },
            {
              title: 'Renewable Energy Solutions',
              items: [
                { label: 'Solar and Wind Power', text: 'Provide reliable electricity through solar panels and wind turbines in shelters and resettled communities.' },
                { label: 'Solar-Powered Cooking Stoves', text: 'Introduce eco-friendly stoves to reduce deforestation and improve air quality.' },
              ],
            },
            {
              title: 'Community Infrastructure Development',
              items: [
                { label: 'Schools and Learning Centers', text: 'Ensure uninterrupted education by building schools and vocational centers in disaster zones.' },
                { label: 'Healthcare Facilities', text: 'Set up basic health centers to cater to emergency needs and promote maternal and child health services.' },
              ],
            },
            {
              title: 'Sustainable Land Management and Reforestation',
              items: [
                { label: 'Afforestation and Reforestation', text: 'Plant trees and establish green belts to mitigate the effects of floods and desertification.' },
                { label: 'Soil and Water Conservation', text: 'Encourage sustainable farming practices to improve agricultural output and resilience.' },
              ],
            },
            {
              title: 'Government and Community Partnership',
              items: [
                { label: 'Public-Private Partnerships', text: 'Engage the government, private sector, and NGOs to fund shelter projects and infrastructure development.' },
                { label: 'Community-Led Solutions', text: 'Involve local communities in the design and execution of sustainable infrastructure interventions.' },
              ],
            },
            {
              title: 'Capacity Building and Training',
              items: [
                { label: 'Disaster Risk Reduction Education', text: 'Provide training to communities on disaster preparedness and risk reduction strategies.' },
                { label: 'Skills Development', text: 'Offer vocational training in renewable energy, agriculture, and construction to displaced populations.' },
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
          href="/strategy/wash"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/agriculture"
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