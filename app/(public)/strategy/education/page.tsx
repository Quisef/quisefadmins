'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'STEM and Digital Education - QuietShelter Empowerment Foundation',
  description: 'Discover QuietShelter’s sustainable solutions to enhance STEM and digital education in Nigeria.',
  openGraph: {
    title: 'STEM and Digital Education - QuietShelter Empowerment Foundation',
    description: 'Discover QuietShelter’s sustainable solutions to enhance STEM and digital education in Nigeria.',
    url: 'https://your-domain.com/strategy/education',
    images: ['/images/education.png'],
  },
};

export default function EducationPage() {
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
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            STEM and Digital Education Challenges in Nigeria
          </h1>
        </div>
      </section>

      {/* Navigation Buttons (Top) */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/climate"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/sgbv"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          The Importance and Challenges of STEM Education in Nigeria
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Since the U.S. National Science Foundation introduced STEM education in 2001, it has been recognized as
          essential for fostering critical thinking and preparing students for scientific careers. Despite its
          potential to drive innovation, STEM education in Nigeria faces numerous challenges, leaving the country
          lagging in global competitiveness.
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/education.png"
            alt="STEM Education in Nigeria"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation's Sustainable Solution for STEM and Digital Education
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Specialized Teacher Training Programs',
              items: [
                { label: 'Comprehensive Professional Development', text: 'Continuous training programs for teachers on STEM and digital education, focusing on hands-on learning, modern STEM tools, and effective teaching strategies.' },
                { label: 'Certification and Incentives', text: 'Certification programs for teachers completing STEM training, along with salary bonuses and career advancement incentives to encourage high-quality education.' },
              ],
            },
            {
              title: 'Student Training and Engagement',
              items: [
                { label: 'Hands-On Learning Experiences', text: 'Interactive learning opportunities such as science fairs, coding boot camps, and robotics clubs to help students develop practical skills and creativity.' },
                { label: 'Mentorship and Career Guidance', text: 'Pairing students with mentors from STEM industries for career guidance and exposure to real-world applications.' },
              ],
            },
            {
              title: 'Development of a Unique STEM Curriculum',
              items: [
                { label: 'Localized and Contextualized Content', text: 'A Nigerian-focused STEM curriculum that incorporates local challenges and opportunities, emphasizing problem-solving and critical thinking.' },
                { label: 'Integration of Digital Literacy', text: 'Ensure that digital literacy is a core part of the curriculum, including coding, data analysis, and cybersecurity.' },
              ],
            },
            {
              title: 'Mobile State-of-the-Art STEM and Digital Laboratories',
              items: [
                { label: 'Mobile Labs for Rural and Underserved Areas', text: 'Bringing high-quality STEM education to rural areas with mobile labs equipped with computers, robotics kits, and solar power options.' },
                { label: 'Trained Facilitators', text: 'Staff mobile labs with facilitators who provide hands-on activities and training to local teachers.' },
              ],
            },
            {
              title: 'Community and Government Engagement',
              items: [
                { label: 'Partnerships with Local Communities', text: 'Involve local communities in planning STEM initiatives to ensure the programs meet their needs.' },
                { label: 'Government Support and Policy Advocacy', text: 'Advocate for increased government funding and policy changes to prioritize STEM education.' },
              ],
            },
            {
              title: 'Monitoring, Evaluation, and Continuous Improvement',
              items: [
                { label: 'Data-Driven Decision Making', text: 'Implement monitoring systems to track progress and make data-driven improvements to the programs.' },
                { label: 'Feedback Loops', text: 'Regular feedback from teachers, students, and communities to continuously refine curriculum and training programs.' },
              ],
            },
            {
              title: 'Sustainability and Scaling',
              items: [
                { label: 'Capacity Building for Sustainability', text: 'Train local educators and administrators to sustain and expand STEM initiatives over time.' },
                { label: 'Replication and Scaling', text: 'Develop a model for replicating and scaling the STEM programs across Nigeria’s underserved regions.' },
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
          href="/strategy/climate"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/sgbv"
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