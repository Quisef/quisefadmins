'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const DonationPage: React.FC = () => {
    return (
      <main className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-blue-600 text-white py-16 px-6 text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/box.jpg')" }}>
    
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              Make a Difference Today
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
              Your donation can change lives. Join us in our mission to create a better world for everyone. Every contribution counts!
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
                  style={{ width: '15%' }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">$3,000</h3>
                  <p className="text-gray-600 text-sm md:text-base">Raised so far</p>
                </div>
                <div className="bg-yellow-50 p-4 md:p-6 rounded-lg text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-2">$20,000</h3>
                  <p className="text-gray-600 text-sm md:text-base">Target goal</p>
                </div>
                <div className="bg-green-50 p-4 md:p-6 rounded-lg text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">234</h3>
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
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Combat Global Poverty</h2>
                <p className="text-gray-700 text-base md:text-lg">
                  Nearly 700 million people live in extreme poverty worldwide, surviving on less than $1.90 a day. Your support helps provide:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Emergency food and clean water</li>
                  <li>Sustainable farming equipment and training</li>
                  <li>Education and vocational training</li>
                  <li>Microfinance opportunities</li>
                  <li>Healthcare access for families</li>
                </ul>
                <p className="text-gray-700 text-base md:text-lg">
                  Together, we can break the cycle of poverty and create lasting change for generations to come.
                </p>
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
              {[
                {
                  image: '/images/climate.jpg',
                  title: 'Climate Change',
                  description:
                    'Join us in providing a safe haven for vulnerable children fleeing the harsh realities of climate change. Your support can offer them the comfort and security they so desperately need.',
                  raised: 500,
                  goal: 5000,
                  color: 'yellow',
                },
                {
                  image: '/images/kids.jpg',
                  title: 'Healthcare Access',
                  description:
                    'Together, we can address health challenges in communities where basic medical care is out of reach. Join us in making a life-saving difference.',
                  raised: 1000,
                  goal: 5000,
                  color: 'blue',
                },
                {
                  image: '/images/gras.jpg',
                  title: 'Food Security',
                  description:
                    'Discover how we are empowering young people in the agricultural sector, equipping them with the skills and resources to cultivate a brighter future.',
                  raised: 500,
                  goal: 5000,
                  color: 'green',
                },
              ].map((cause, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 sm:h-56 w-full">
                    <Image
                      src={cause.image}
                      alt={cause.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{cause.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
                      {cause.description}
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                      <div
                        className={`h-full bg-${cause.color}-500 rounded-full transition-all duration-500`}
                        style={{ width: `${(cause.raised / cause.goal) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>${cause.raised.toLocaleString()} raised</span>
                      <span>Goal: ${cause.goal.toLocaleString()}</span>
                    </div>
                    <Link
                      href="#donation-form"
                      className={`block text-center bg-${cause.color}-600 hover:bg-${cause.color}-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md`}
                    >
                      Donate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  };
  
  export default DonationPage;
  