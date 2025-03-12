'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
const metadata: Metadata = {
  title: 'Careers - QuietShelter Empowerment Foundation',
  description: 'Join QuietShelter’s team through meaningful career and volunteer opportunities to make a global impact.',
  openGraph: {
    title: 'Careers - QuietShelter Empowerment Foundation',
    description: 'Join QuietShelter’s team through meaningful career and volunteer opportunities to make a global impact.',
    url: 'https://www.quietshelterfoundation.com/careers',
    images: ['/images/legs.jpg'],
  },
};

interface Opportunity {
  id: string;
  imageUrl: string;
  type: 'Full Time' | 'Part Time' | 'Volunteer';
  title: string;
  location: string;
  description: string;
  href: string;
  category: 'Jobs' | 'Volunteer';
}

interface Stats {
  totalOpenings: number;
  totalLocations: number;
  totalVolunteers: number;
}

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState('All Opportunities');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOpenings: 0, totalLocations: 0, totalVolunteers: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch opportunities
        const opportunitiesCollection = collection(db, 'opportunities');
        const opportunitiesSnapshot = await getDocs(opportunitiesCollection);
        const opportunitiesList: Opportunity[] = opportunitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Opportunity));
        setOpportunities(opportunitiesList);

        // Fetch stats
        const statsCollection = collection(db, 'stats');
        const statsSnapshot = await getDocs(statsCollection);
        const statsData = statsSnapshot.docs[0]?.data() || { totalOpenings: 0, totalLocations: 0, totalVolunteers: 0 };
        setStats(statsData as Stats);

        console.log('Fetched opportunities:', opportunitiesList);
        console.log('Fetched stats:', statsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOpportunities = activeTab === 'All Opportunities'
    ? opportunities
    : opportunities.filter((opp) =>
        activeTab === 'Careers' ? ['Full Time', 'Part Time'].includes(opp.type) : opp.category === activeTab
      );

  const volunteerOpportunities = opportunities.filter((opp) => opp.type === 'Volunteer');

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-20 px-4 sm:px-6 text-center" style={{ backgroundImage: "url('/images/vision.jpg')" }}>
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Join Our Team
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-blue-100">
            Make a difference in the world through meaningful work and volunteer opportunities.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stats.totalOpenings}+</div>
            <div className="text-gray-600 text-sm sm:text-base md:text-lg">Open Positions</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stats.totalLocations}</div>
            <div className="text-gray-600 text-sm sm:text-base md:text-lg">Global Locations</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stats.totalVolunteers}+</div>
            <div className="text-gray-600 text-sm sm:text-base md:text-lg">Volunteers Worldwide</div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="tabs flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
            {['All Opportunities', 'Careers', 'Jobs', 'Volunteer'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base md:text-lg transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredOpportunities.length === 0 ? (
              <p className="text-center text-gray-600 col-span-full text-sm sm:text-base md:text-lg">
                No openings available for {activeTab.toLowerCase()}.
              </p>
            ) : (
              filteredOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-40 sm:h-48 md:h-56 w-full">
                    <Image
                      src={opp.imageUrl || '/placeholder.jpg'}
                      alt={opp.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                      onError={(e) => console.error(`Failed to load image: ${opp.imageUrl}`)}
                    />
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        opp.type === 'Full Time'
                          ? 'bg-blue-100 text-blue-600'
                          : opp.type === 'Part Time'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {opp.type}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{opp.title}</h3>
                    <div className="text-gray-600 text-xs sm:text-sm md:text-base">📍 {opp.location}</div>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base line-clamp-2">{opp.description}</p>
                    <Link
                      href={opp.href}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md text-sm sm:text-base"
                    >
                      {opp.type === 'Volunteer' ? 'Join Us' : 'Apply Now'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
          <div className="lg:w-1/2 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Why Join Us?</h2>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg">
              We’re committed to making a positive impact on communities worldwide. Our team members enjoy:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm sm:text-base">
              <li>Competitive compensation and benefits</li>
              <li>Professional development opportunities</li>
              <li>Flexible work arrangements</li>
              <li>Meaningful work that makes a difference</li>
              <li>Collaborative and inclusive work environment</li>
            </ul>
            <Link
              href="/career"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-md transition-all duration-300 hover:shadow-md text-sm sm:text-base"
            >
              View All Opportunities
            </Link>
          </div>
          <div className="lg:w-1/2">
            <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-lg">
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

      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 sm:mb-12 md:mb-16">
            Featured Volunteer Opportunities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {volunteerOpportunities.length === 0 ? (
              <p className="text-center text-gray-600 col-span-full text-sm sm:text-base md:text-lg">
                No volunteer opportunities available.
              </p>
            ) : (
              volunteerOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-40 sm:h-48 md:h-56 w-full">
                    <Image
                      src={opp.imageUrl || '/placeholder.jpg'}
                      alt={opp.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                      onError={(e) => console.error(`Failed to load image: ${opp.imageUrl}`)}
                    />
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-600">
                      {opp.type}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{opp.title}</h3>
                    <div className="text-gray-600 text-xs sm:text-sm md:text-base">📍 {opp.location}</div>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base line-clamp-2">{opp.description}</p>
                    <Link
                      href={opp.href}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md text-sm sm:text-base"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}