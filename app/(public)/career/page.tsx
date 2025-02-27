'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const metadata: Metadata = {
  title: 'Careers - QuietShelter Empowerment Foundation',
  description: 'Join QuietShelter’s team through meaningful career and volunteer opportunities to make a global impact.',
  openGraph: {
    title: 'Careers - QuietShelter Empowerment Foundation',
    description: 'Join QuietShelter’s team through meaningful career and volunteer opportunities to make a global impact.',
    url: 'https://your-domain.com/careers',
    images: ['/images/legs.jpg'],
  },
};

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState('All Opportunities');

  const opportunities = [
    {
      image: '/images/stren.jpg',
      type: 'Full Time',
      title: 'Program Manager',
      location: 'Jimeta, AD',
      description: 'Lead and oversee our community development programs. 5+ years of experience required.',
      href: '/careers/apply/program-manager',
      category: 'Jobs',
    },
    {
      image: '/images/chill.jpg',
      type: 'Part Time',
      title: 'Project Coordinator',
      location: 'Jimeta, AD',
      description: 'Support project teams and coordinate activities. Flexible hours available.',
      href: '/careers/apply/project-coordinator',
      category: 'Jobs',
    },
    {
      image: '/images/biz.jpg',
      type: 'Volunteer',
      title: 'Community Outreach',
      location: 'Multiple Locations',
      description: 'Make a difference in your community through various outreach programs.',
      href: '/careers/apply/community-outreach',
      category: 'Volunteer',
    },
    {
      image: '/images/innovtion.png',
      type: 'Volunteer',
      title: 'Education Mentor',
      location: 'Various Locations',
      description: 'Help students achieve their potential through mentoring and tutoring.',
      href: '/careers/apply/education-mentor',
      category: 'Volunteer',
    },
    {
      image: '/images/another.jpg',
      type: 'Volunteer',
      title: 'Environmental Project',
      location: 'Global Opportunities',
      description: 'Participate in conservation and environmental protection initiatives.',
      href: '/careers/apply/environmental-project',
      category: 'Volunteer',
    },
    {
      image: '/images/doc.jpg',
      type: 'Volunteer',
      title: 'Healthcare Support',
      location: 'Multiple Locations',
      description: 'Support healthcare initiatives and community wellness programs.',
      href: '/careers/apply/healthcare-support',
      category: 'Volunteer',
    },
  ];

  const filteredOpportunities = activeTab === 'All Opportunities'
    ? opportunities
    : opportunities.filter((opp) => 
        activeTab === 'Careers' ? ['Full Time', 'Part Time'].includes(opp.type) : opp.category === activeTab
      );

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-6 text-center" style={{ backgroundImage: "url('/images/vision.jpg')" }}>
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100">
            Make a difference in the world through meaningful work and volunteer opportunities.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-gray-600 text-base md:text-lg">Open Positions</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">4</div>
            <div className="text-gray-600 text-base md:text-lg">Global Locations</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600 text-base md:text-lg">Volunteers Worldwide</div>
          </div>
        </div>
      </section>

      {/* Opportunities Tab Section */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="tabs flex flex-wrap justify-center gap-4 mb-12">
            {['All Opportunities', 'Careers', 'Jobs', 'Volunteer'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-medium text-base md:text-lg transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOpportunities.map((opp, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 sm:h-56 w-full">
                  <Image
                    src={opp.image}
                    alt={opp.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      opp.type === 'Full Time'
                        ? 'bg-blue-100 text-blue-600'
                        : opp.type === 'Part Time'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {opp.type}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800">{opp.title}</h3>
                  <div className="text-gray-600 text-sm md:text-base">📍 {opp.location}</div>
                  <p className="text-gray-600 text-sm md:text-base line-clamp-2">{opp.description}</p>
                  <Link
                    href={opp.href}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md"
                  >
                    {opp.type === 'Volunteer' ? 'Join Us' : 'Apply Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Why Join Us?</h2>
            <p className="text-gray-700 text-base md:text-lg">
              We’re committed to making a positive impact on communities worldwide. Our team members enjoy:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Competitive compensation and benefits</li>
              <li>Professional development opportunities</li>
              <li>Flexible work arrangements</li>
              <li>Meaningful work that makes a difference</li>
              <li>Collaborative and inclusive work environment</li>
            </ul>
            <Link
              href="/careers/apply"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition-all duration-300 hover:shadow-md"
            >
              View All Opportunities
            </Link>
          </div>
          <div className="lg:w-1/2">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/legs.jpg"
                alt="Team Collaboration"
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Volunteer Opportunities Section */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Featured Volunteer Opportunities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities
              .filter((opp) => opp.type === 'Volunteer')
              .map((opp, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 sm:h-56 w-full">
                    <Image
                      src={opp.image}
                      alt={opp.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-600">
                      {opp.type}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800">{opp.title}</h3>
                    <div className="text-gray-600 text-sm md:text-base">📍 {opp.location}</div>
                    <p className="text-gray-600 text-sm md:text-base line-clamp-2">{opp.description}</p>
                    <Link
                      href={opp.href}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}