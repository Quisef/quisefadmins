'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'Water, Sanitation, and Hygiene (WASH) - QuietShelter Empowerment Foundation',
  description: 'Learn about QuietShelter’s holistic and sustainable solutions for Water, Sanitation, and Hygiene (WASH) challenges in Nigeria.',
  openGraph: {
    title: 'Water, Sanitation, and Hygiene (WASH) - QuietShelter Empowerment Foundation',
    description: 'Learn about QuietShelter’s holistic and sustainable solutions for Water, Sanitation, and Hygiene (WASH) challenges in Nigeria.',
    url: 'https://your-domain.com/strategy/wash',
    images: ['/images/washori.jpg'],
  },
};

export default function WashPage() {
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
      <section className="bg-gradient-to-r from-cyan-600 to-cyan-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Water, Sanitation, and Hygiene (WASH)
          </h1>
        </div>
      </section>

      {/* Navigation Buttons (Top) */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/sgbv"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/shelter"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Water, Sanitation, and Hygiene (WASH)
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          In 2018, the Nigerian government declared a state of emergency in the Water, Sanitation, and Hygiene (WASH)
          sector. By 2019, a combination of inadequate infrastructure, insufficient human capital, poor investment, and
          weak regulatory frameworks left approximately 60 million Nigerians without access to basic drinking water.
          Around 80 million people lacked improved sanitation facilities, and a staggering 167 million couldn’t access
          basic handwashing services. The situation is especially dire in rural areas, where 39% of households do not
          have access to basic water supply, and only half benefit from improved sanitation. Almost a third of the rural
          population (29%) continues to practice open defecation—a statistic that has barely shifted since 1990.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Women and girls are disproportionately affected by the lack of adequate WASH services. They are often
          responsible for collecting water, sometimes over long distances, which negatively impacts their health,
          school attendance, and heightens their vulnerability to gender-based violence (GBV). Access to WASH services
          can have a transformative impact on education, as it reduces the time children, especially girls, spend
          fetching water, minimizes waterborne diseases that keep children out of school, and contributes to a safer,
          healthier learning environment.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Access to clean water and sanitation is not only a basic human right but also a key to breaking the cycle of
          poverty and improving productivity, as highlighted by Sustainable Development Goal 6. The lack of safe water
          and sanitation hinders economic potential, particularly in marginalized communities, which are often excluded
          from essential services and infrastructure. The World Health Organization (WHO) has long recognized the
          importance of potable water and sanitation as a core component of primary health care. In 1978, WHO set basic
          daily water requirements at 60 liters per person, emphasizing that access to safe drinking water and
          sanitation is a fundamental right for all. Despite these global efforts, Nigeria’s rural communities, which
          account for 46% of the population, continue to face severe challenges.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Addressing the water crisis in Nigeria’s rural areas is not just a matter of urgency, but a necessity for
          promoting health, education, gender equality, and sustainable development. Both government authorities,
          international and non-governmental organizations must take swift and decisive action to ensure access to
          clean, safe, and sustainable water and sanitation for all.
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/hygiene.jpeg"
            alt="Water, Sanitation, and Hygiene (WASH)"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation's Holistic and Sustainable Approach for WASH Solutions
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Infrastructure Development',
              items: [
                { label: 'Boreholes and Solar-Powered Water Systems', text: 'Install solar-powered boreholes and gravity-fed water systems in rural communities to provide a consistent, clean water supply. Solar energy is sustainable, reduces operational costs, and ensures water access in off-grid areas.' },
                { label: 'Rainwater Harvesting', text: 'In areas where boreholes are not viable, rainwater harvesting systems can be introduced to collect and store rainwater for drinking and household use.' },
                { label: 'Sanitation Facilities', text: 'Construct eco-friendly and low-cost latrines, especially in areas practicing open defecation. These facilities should be designed for durability, ease of maintenance, and local context.' },
                { label: 'Handwashing Stations', text: 'Install handwashing facilities in homes, schools, markets, and healthcare centers to promote hygiene. This can be coupled with soap or low-cost alternatives like ash to ensure ongoing use.' },
              ],
            },
            {
              title: 'Community-Led Total Sanitation (CLTS)',
              items: [
                { label: 'Behavioral Change Campaigns', text: 'Implement community-led sanitation initiatives to raise awareness about the importance of hygiene, eliminating open defecation, and maintaining proper sanitation practices. Engaging communities directly fosters ownership and long-term sustainability.' },
                { label: 'Education and Training', text: 'Offer regular training for households and local leaders on water purification techniques, waste management, and hygiene practices. This includes educating on the importance of safe water storage and menstrual hygiene management for women and girls.' },
              ],
            },
            {
              title: 'Empowerment of Women and Girls',
              items: [
                { label: 'Women-Led WASH Committees', text: 'Establish women-led WASH committees in each community to oversee water and sanitation projects. Women are directly affected by water scarcity and poor sanitation, making them key stakeholders in ensuring the maintenance and proper use of WASH infrastructure.' },
                { label: 'Gender-Sensitive WASH Facilities', text: 'Ensure that sanitation facilities are safe and gender-sensitive, with separate spaces for men, women, and children. This will reduce the risk of gender-based violence (GBV), particularly in areas where women and girls have to travel far to access water or use unsanitary facilities.' },
              ],
            },
            {
              title: 'Environmental Sustainability and Adaptation',
              items: [
                { label: 'Develop Basic Infrastructure', text: 'Prioritize the construction of small-scale infrastructure, such as farm-to-market roads, storage facilities, and small irrigation schemes. Engage the community in the construction process to build local capacity and ownership.' },
                { label: 'Waste-to-Resource Solutions', text: 'Develop systems that convert human waste into biogas for cooking or fertilizer for farming, reducing environmental contamination and providing energy and agricultural support for communities.' },
              ],
            },
            {
              title: 'Public-Private Partnerships and Investment in WASH',
              items: [
                { label: 'Private Sector Engagement', text: 'Encourage partnerships with private companies, NGOs, and international donors to invest in WASH infrastructure in rural areas. These partnerships can focus on funding, expertise sharing, and technology transfer.' },
                { label: 'Microfinance and Local Enterprises', text: 'Support local entrepreneurs in setting up small businesses around WASH services (e.g., sanitation maintenance, water delivery, soap production). This creates a self-sustaining local economy while ensuring ongoing support for the infrastructure.' },
              ],
            },
            {
              title: 'Capacity Building and Local Ownership',
              items: [
                { label: 'Train Local Technicians', text: 'Establish local capacity-building programs to train community members on maintaining and repairing water systems and sanitation facilities. This creates local jobs and ensures that communities can manage their own WASH infrastructure in the long term.' },
                { label: 'Institutional Support and Regulation', text: 'Strengthen the regulatory framework and local governance of WASH services to ensure accountability and consistent service delivery. Regular monitoring and evaluation should be conducted to assess the effectiveness and sustainability of projects.' },
              ],
            },
            {
              title: 'Monitoring, Evaluation, and Data Collection',
              items: [
                { label: 'Digital Water Monitoring Systems', text: 'Use technology like remote sensors and mobile apps to monitor water supply and sanitation usage. This data can inform government and non-governmental organizations (NGOs) to ensure real-time monitoring and quick interventions.' },
                { label: 'Community Feedback Mechanisms', text: 'Establish feedback loops through community meetings or mobile platforms to ensure that the voices of local populations are heard, and any issues with water or sanitation services are promptly addressed.' },
              ],
            },
            {
              title: 'Sustainability through Renewable Energy',
              items: [
                { label: 'Renewable Energy Integration', text: 'Power water pumps and sanitation systems using renewable energy sources, like solar and wind. This ensures that WASH infrastructure operates consistently without relying on erratic or expensive electricity supply.' },
                { label: 'Hybrid WASH Systems', text: 'Develop hybrid systems combining solar and rainwater harvesting to ensure uninterrupted water access even during the dry season or times of water stress.' },
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
          href="/strategy/sgbv"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/shelter"
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