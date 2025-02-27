'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const metadata: Metadata = {
  title: 'Agriculture and Food Security - QuietShelter Empowerment Foundation',
  description: 'Learn about QuietShelter’s approach to addressing agriculture and food security challenges in Nigeria.',
  openGraph: {
    title: 'Agriculture and Food Security - QuietShelter Empowerment Foundation',
    description: 'Learn about QuietShelter’s approach to addressing agriculture and food security challenges in Nigeria.',
    url: 'https://your-domain.com/strategy/agriculture',
    images: ['/images/anima.jpg'],
  },
};

export default function AgriculturePage() {
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
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Agriculture and Food Security
          </h1>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 flex justify-between">
        <Link
          href="/strategy/shelter"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/climate"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Next
        </Link>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Agriculture and Food Security Challenge in Nigeria
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          Agriculture in Nigeria is categorized into four main sectors: crop production, fishing, livestock, and
          forestry. Despite its diverse nature, agriculture remains the backbone of Nigeria's economy, contributing an
          average of 24% to the nation's GDP from 2013 to 2019. Moreover, it employs over 36% of the country's labor
          force, making it the largest employer in the nation. However, Nigeria's agricultural sector faces multiple
          challenges. These include frequent flooding, desertification of croplands and grazing areas, extremist
          insurgencies, and ongoing conflicts between herders and farmers. Additional hurdles such as low technological
          adoption, high production costs, inefficient input distribution, limited access to financing, and substantial
          post-harvest losses further weaken the sector. The lack of market access due to inadequate value addition and
          supply-chain infrastructure, combined with outdated farming methods and insufficient research and
          record-keeping, exacerbate these issues.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
          The Nigerian Economic Summit Group reports a troubling rise in food insecurity: the number of food-insecure
          Nigerians surged from 66.2 million in Q1 2023 to 100 million in Q1 2024 (WFP, 2024). As of March 2024, 18.6
          million people are facing acute hunger, with 43.7 million Nigerians adopting crisis-level or more severe
          hunger-coping strategies. This unprecedented crisis demands urgent humanitarian assistance, robust social
          protection programs, and comprehensive food systems reforms.
        </p>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-semibold">
          Quiet Shelter Empowerment Foundation approach for a Sustainable and Holistic Solution to Agriculture and Food
          Security Challenges in small and rural communities of Nigeria
        </p>
      </div>

      {/* Image Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src="/images/anima.jpg"
            alt="Agriculture in Nigeria"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Approach Section */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          Quiet Shelter Empowerment Foundation Approach for a Sustainable and Holistic Solution
        </h1>
        <div className="space-y-8">
          {[
            {
              title: 'Community-Led Development (CLD) Approach',
              items: [
                { label: 'Empower Local Leadership', text: 'Engage community leaders, traditional rulers, and local government officials to drive the implementation of agricultural initiatives.' },
                { label: 'Form Community-Based Organizations (CBOs)', text: 'Establish or strengthen existing CBOs, including farmer cooperatives, women’s groups, and youth associations, to take ownership of agricultural projects.' },
              ],
            },
            {
              title: 'Participatory Planning and Needs Assessment',
              items: [
                { label: 'Conduct Participatory Rural Appraisal (PRA)', text: 'Use PRA techniques to assess the specific needs, challenges, and opportunities within each community. This ensures that interventions are tailored to local contexts and address the most pressing issues.' },
                { label: 'Co-Design Solutions', text: 'Involve community members in designing the implementation plan, ensuring that they have a voice in selecting the most appropriate interventions, such as which crops to focus on or which irrigation methods to adopt.' },
              ],
            },
            {
              title: 'Access to Resources and Inputs',
              items: [
                { label: 'Input Supply Chains', text: 'Develop local supply chains for quality seeds, fertilizers, and farming tools. Collaborate with local entrepreneurs and cooperatives to set up input distribution centers that are easily accessible to farmers.' },
                { label: 'Microfinance and Savings Groups', text: 'Facilitate the establishment of village savings and loan associations (VSLAs) or microfinance groups to provide farmers with access to credit for purchasing inputs or investing in farm infrastructure.' },
              ],
            },
            {
              title: 'Infrastructure Development and Technology Adoption',
              items: [
                { label: 'Develop Basic Infrastructure', text: 'Prioritize the construction of small-scale infrastructure, such as farm-to-market roads, storage facilities, and small irrigation schemes. Engage the community in the construction process to build local capacity and ownership.' },
                { label: 'Promote Low-Cost Technologies', text: 'Introduce affordable, locally-appropriate technologies such as solar-powered irrigation pumps, mobile phone-based market information systems, and improved storage bags to reduce post-harvest losses.' },
              ],
            },
            {
              title: 'Market Access and Value Addition',
              items: [
                { label: 'Establish Local Market Hubs', text: 'Create or strengthen local market hubs where farmers can sell their produce. Support the development of value chains by promoting small-scale agro-processing enterprises, such as cassava processing or fish smoking units.' },
                { label: 'Market Information Systems', text: 'Use mobile technology to provide farmers with real-time market prices, weather forecasts, and best practices. Partner with local telecom providers to disseminate this information via SMS or community radio.' },
              ],
            },
            {
              title: 'Monitoring, Evaluation, and Adaptive Management',
              items: [
                { label: 'Set Up Community Monitoring Teams', text: 'Form teams within the community to regularly monitor the progress of agricultural interventions. Use simple tools and indicators to track outcomes, such as yield improvements, income increases, and food security levels.' },
                { label: 'Adaptive Management', text: 'Be flexible and willing to adjust strategies based on feedback from the community and ongoing monitoring. If certain interventions are not yielding the desired results, work with the community to modify the approach.' },
              ],
            },
            {
              title: 'Building Partnerships and Leveraging External Support',
              items: [
                { label: 'Engage NGOs and Development Partners', text: 'Collaborate with non-governmental organizations, international development agencies, and private sector partners to bring additional expertise, resources, and funding to support community initiatives.' },
                { label: 'Government Collaboration', text: 'Work closely with local government agricultural extension services to ensure alignment with national agricultural policies and access to government resources.' },
              ],
            },
            {
              title: 'Sustainability and Exit Strategy',
              items: [
                { label: 'Promote Self-Reliance', text: 'Gradually reduce external support as the community builds capacity and becomes more self-sufficient. Encourage the formation of sustainable business models, such as cooperative-owned input supply stores or processing facilities, that can continue operating independently.' },
                { label: 'Institutionalize Success', text: 'Document and share successful practices within and across communities, enabling the replication of effective models. Ensure that local institutions, such as schools or local government offices, continue to support agricultural development after the initial intervention period.' },
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
          href="/strategy/shelter"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
        >
          Previous
        </Link>
        <Link
          href="/strategy/climate"
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