'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Interfaces
interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // Stores Cloudinary secure_url
  raised: number;
  goal: number;
  color: string;
}

interface Progress {
  raised: number;
  goal: number;
  donors: number;
}

// Map color string to Tailwind color classes
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; hover: string }> = {
    blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-700' },
    green: { bg: 'bg-green-500', hover: 'hover:bg-green-700' },
    red: { bg: 'bg-red-500', hover: 'hover:bg-red-700' },
    yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-700' },
    purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-700' },
    pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-700' },
    indigo: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-700' },
    teal: { bg: 'bg-teal-500', hover: 'hover:bg-teal-700' },
    orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-700' },
    gray: { bg: 'bg-gray-500', hover: 'hover:bg-gray-700' },
    default: { bg: 'bg-blue-500', hover: 'hover:bg-blue-700' },
  };

  return colorMap[color] || colorMap.default;
};

// Memoized Cause Card Component
const CauseCard = memo(({ cause }: { cause: Cause }) => {
  const colorClasses = getColorClasses(cause.color);
  const progressPercentage = cause.goal > 0 ? Math.min((cause.raised / cause.goal) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={cause.imageUrl || '/images/fallback.jpg'}
          alt={cause.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/fallback.jpg';
            console.error(`Failed to load image: ${cause.imageUrl}`);
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{cause.title}</h3>
        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
          {cause.description}
        </p>
        <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full ${colorClasses.bg} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>${cause.raised.toLocaleString()} raised</span>
          <span>Goal: ${cause.goal.toLocaleString()}</span>
        </div>
        <Link
          href="#donation-form"
          className={`block text-center ${colorClasses.bg} ${colorClasses.hover.replace(
            'hover:',
            ''
          )} text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md`}
        >
          Donate
        </Link>
      </div>
    </div>
  );
});

CauseCard.displayName = 'CauseCard';

// Main Component
const DonationPage: React.FC = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [progress, setProgress] = useState<Progress>({ raised: 0, goal: 20000, donors: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [causesSnapshot, progressSnapshot] = await Promise.all([
        getDocs(collection(db, 'causes')),
        getDocs(collection(db, 'progress')),
      ]);

      const causesData = causesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Cause));

      const progressData = progressSnapshot.empty
        ? { raised: 0, goal: 20000, donors: 0 }
        : (progressSnapshot.docs[0].data() as Progress);

      // Update state only if data has changed to prevent unnecessary re-renders
      setCauses((prevCauses) =>
        JSON.stringify(prevCauses) !== JSON.stringify(causesData) ? causesData : prevCauses
      );
      setProgress((prevProgress) =>
        JSON.stringify(prevProgress) !== JSON.stringify({
          raised: progressData.raised || 0,
          goal: progressData.goal || 20000,
          donors: progressData.donors || 0,
        })
          ? {
              raised: progressData.raised || 0,
              goal: progressData.goal || 20000,
              donors: progressData.donors || 0,
            }
          : prevProgress
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setCauses([]);
      setProgress({ raised: 0, goal: 20000, donors: 0 });
    } finally {
      setLoading(false);
    }
  }, [db]); // Explicitly include db as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is stable due to useCallback

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = progress.goal > 0 ? Math.min((progress.raised / progress.goal) * 100, 100) : 0;

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-16 px-6 text-center bg-cover bg-center">
        <div className="absolute inset-0">
          <Image
            src="/images/box.jpg"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-20"
            priority
          />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Make a Difference Today
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
            Your donation can change lives. Join us in our mission to create a better world.
          </p>
          <Link
            href="#donation-form"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:shadow-lg"
          >
            Donate Now
          </Link>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12">
            Our Current Progress
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-4 md:h-6 bg-gray-200 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                  ${progress.raised.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">Raised so far</p>
              </div>
              <div className="bg-yellow-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-2">
                  ${progress.goal.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">Target goal</p>
              </div>
              <div className="bg-green-50 p-4 md:p-6 rounded-lg text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                  {progress.donors}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">Total donors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cause */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-md">
              <Image
                src="/images/waterboy.jpg"
                alt="Poverty Relief"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Combat Global Poverty
              </h2>
              <p className="text-gray-700 text-base md:text-lg">
                Nearly 700 million people live in extreme poverty worldwide...
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Emergency food and clean water</li>
                <li>Sustainable farming equipment and training</li>
                <li>Education and vocational training</li>
                <li>Microfinance opportunities</li>
                <li>Healthcare access for families</li>
              </ul>
              <Link
                href="#donation-form"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg"
              >
                Support This Cause
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cause Cards */}
      <section className="py-12 md:py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.isArray(causes) && causes.length > 0 ? (
              causes.map((cause) => (
                <CauseCard key={cause?.id || Math.random().toString()} cause={cause} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-600">
                  No causes available at the moment. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DonationPage;