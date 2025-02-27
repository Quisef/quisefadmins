'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'Environmental and Climate Challenges - QuietShelter Empowerment Foundation',
  description: 'Learn about QuietShelter’s approach to tackling environmental and climate challenges in Nigeria.',
  openGraph: {
    title: 'Environmental and Climate Challenges - QuietShelter Empowerment Foundation',
    description: 'Learn about QuietShelter’s approach to tackling environmental and climate challenges in Nigeria.',
    url: 'https://your-domain.com/strategy/climate',
    images: ['/images/climate.jpg'],
  },
};

export default function ClimatePage() {
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Environmental and Climate Challenges in Nigeria
          </h1>
        </div>
      </section>

      {/* Navigation Buttons (Top) */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/agriculture"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/education"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Environmental and Climate Challenges in Nigeria
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          The environment is a life-supporting system essential for human existence. Climate change, natural disasters,
          and human activities are placing unprecedented pressure on environmental conditions. Nigeria faces unique
          challenges due to its weak resilience and low adaptive capacity to climate change.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Key issues include land degradation, deforestation, pollution, and severe socio-economic impacts, especially
          in rural communities. Vulnerable groups, like children and youths, face increased risks of hunger,
          malnutrition, and exploitation.
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/climate.jpg"
            alt="Environmental Impact in Nigeria"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation's Approach to Environmental and Climate Challenges
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Community Awareness and Education',
              items: [
                { label: 'Awareness Campaigns', text: 'Use media platforms to educate citizens about the effects of environmental degradation.' },
                { label: 'School Programs', text: 'Integrate environmental topics into the school curricula to teach climate change awareness early on.' },
                { label: 'Workshops for Out-of-School Youth', text: 'Develop tailored programs for youth on environmental literacy and sustainable practices.' },
              ],
            },
            {
              title: 'Training and Skill Acquisition',
              items: [
                { label: 'Sustainable Agriculture Training', text: 'Teach climate-resilient farming methods such as crop rotation and water management.' },
                { label: 'Vocational Training', text: 'Provide skills like carpentry and renewable energy to diversify income sources for communities.' },
                { label: 'Digital and Financial Literacy', text: 'Train youth and business owners in essential ICT and financial skills to strengthen economic resilience.' },
              ],
            },
            {
              title: 'Community Empowerment and Engagement',
              items: [
                { label: 'Local Committees', text: 'Form community-led groups focused on sustainable land use and environmental conservation.' },
                { label: 'Participatory Land Management', text: 'Encourage active participation in reforestation, soil conservation, and the protection of water bodies.' },
              ],
            },
            {
              title: 'Mentorship and Networking',
              items: [
                { label: 'Mentorship Programs', text: 'Pair experienced individuals with young people for guidance in environmental management and livelihood skills.' },
                { label: 'Networking Events', text: 'Organize events that bring communities and environmental experts together for knowledge exchange and resource sharing.' },
              ],
            },
            {
              title: 'Government and NGO Collaboration',
              items: [
                { label: 'Partnerships', text: 'Collaborate with government agencies and NGOs to provide policy frameworks and financial incentives for green initiatives.' },
                { label: 'Policy Advocacy', text: 'Engage local leaders to prioritize environmental issues in development planning.' },
              ],
            },
            {
              title: 'Monitoring and Evaluation',
              items: [
                { label: 'Impact Assessment', text: 'Regularly evaluate the effectiveness of initiatives and adjust strategies based on data.' },
                { label: 'Continuous Improvement', text: 'Adapt programs based on feedback from participants and evolving environmental challenges.' },
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
          href="/strategy/agriculture"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/education"
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