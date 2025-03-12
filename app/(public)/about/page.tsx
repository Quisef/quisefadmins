'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const metadata: Metadata = {
  title: 'About Us - QuietShelter Empowerment Foundation',
  description: 'Learn about QuietShelter Empowerment Foundation, our history, team, and impact.',
  openGraph: {
    title: 'About Us - QuietShelter Empowerment Foundation',
    description: 'Learn about QuietShelter Empowerment Foundation, our history, team, and impact.',
    url: 'https://www.quietshelterfoundation/about',
    images: ['/images/cham.jpg'],
  },
};

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<{
    name: string;
    role: string;
    image: string;
    bio: string;
  } | null>(null);

  const teamMembers = [
    { name: 'Mr Goodness Chama', role: 'Executive Chairman', image: '/images/Goodness.jpg', bio: 'Goodness Chama leads with a vision for community empowerment and sustainable change.' },
    { name: 'Mrs Rebecca Ojochoko', role: 'Board Member', image: '/images/Rebecca.jpg', bio: 'Rebecca brings extensive experience in community development to the board.' },
    { name: 'Mr Jean Paul Cleron', role: 'Board Member', image: '/images/Cleron.jpg', bio: 'Jean Paul contributes global expertise in humanitarian efforts.' },
    { name: 'Mrs Wadiam Goodness', role: 'Executive Director', image: '/images/Chama.jpg', bio: 'Wadiam oversees operations with a passion for uplifting the vulnerable.' },
    { name: 'Mr Wisdom Anuhu', role: 'Board Member', image: '/images/wisdom.jpg', bio: 'Wisdom provides strategic insights for organizational growth.' },
    { name: 'Mrs Victoria Ezenduka', role: 'Board Member', image: '/images/Vicky.jpg', bio: 'Victoria advocates for education and empowerment initiatives.' },
    { name: 'Mrs Esther Emmanuel', role: 'Board Member', image: '/images/ojo.jpg', bio: 'Esther focuses on fostering partnerships for impactful programs.' },
  ];

  return (
    <main className="bg-gray-50">
       {/* Hero Section */}
       <section  className="relative min-h-screen flex items-center justify-center text-white px-6 text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/smile.jpg')" }}>
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl text-white sm:text-5xl md:text-6xl font-bold mb-2 mt-1 leading-tight tracking-tight">
            Our Story
          </h1>
        </div>
      </section>
 
      {/* About Section with Animated Image */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Protecting a Child at Every Step
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              The Quiet Shelter Empowerment Foundation is a registered not-for-profit organization established in August 2020 in Jimeta, Yola, Adamawa State, Nigeria. Our primary purpose is to provide humanitarian services to communities, aiming to bring about positive changes and developments.
            </p>
          </div>
          <div className="relative h-84 sm:h-80 lg:h-96 w-full rounded-[90px_10px_10px_10px] overflow-hidden ">
            <Image
              src="/images/Cham.jpg"
              alt="Executive Director Speech"
              fill
              style={{ objectFit: 'cover' }}
              className="absolute inset-0 w-full h-full object-fit object-center transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">Our History</h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Founded in August 2020 amidst the challenges of a global pandemic, QuietShelter Empowerment Foundation emerged from a deep commitment to support vulnerable children and families in Nigeria. Starting in Jimeta, Yola, we began with small-scale initiatives to provide shelter and basic needs, quickly growing into a recognized organization dedicated to sustainable community development. Over the years, we’ve expanded our reach, partnering with local and international stakeholders to address pressing issues like education, sanitation, and gender equity, all while staying true to our roots of compassion and action.
          </p>
        </div>
      </section>

      {/* Aims and Objectives Section */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-5xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">Aims and Objectives</h2>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <ul className="list-disc list-inside text-gray-700 text-base md:text-lg leading-relaxed space-y-4">
              <li>
                <strong>Provide Shelter, Psychosocial Support, and Education (SPE):</strong> Deliver comprehensive support to homeless and vulnerable children, ensuring their safety, mental well-being, and access to learning opportunities.
              </li>
              <li>
                <strong>Enhance Health and Socio-Economic Well-Being:</strong> Improve community health through public health enlightenment, health education, Sexual and Reproductive Health and Rights (SRHR), Gender-Based Violence (GBV) prevention, and Water, Sanitation, and Hygiene (WASH) initiatives.
              </li>
              <li>
                <strong>Promote Gender Equality:</strong> Advocate for the rights of women, youth, children, and other vulnerable populations to foster equity at all societal levels.
              </li>
              <li>
                <strong>Empower Through Skills:</strong> Equip individuals and communities with skill acquisition training to enhance self-reliance and economic opportunities.
              </li>
              <li>
                <strong>Sustainable Livelihoods:</strong> Promote modern social and agricultural practices to ensure long-term economic and environmental sustainability.
              </li>
              <li>
                <strong>Secure Sustainable Funding:</strong> Identify and develop funding sources to support victims of natural disasters, insurgency, terrorism, crises, and health emergencies.
              </li>
              <li>
                <strong>Boost Entrepreneurial Skills:</strong> Enhance the knowledge, skills, and competencies of potential and existing entrepreneurs to promote sustainable livelihoods.
              </li>
              <li>
                <strong>Support Referrals:</strong> Connect victims of social and environmental hazards and their families to appropriate support agencies or organizations.
              </li>
            </ul>
          </div>
        </div>
      </section>


      {/* Team Section with Sliding Images and Modal */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Meet Our Team
          </h1>
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="team-box relative w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] max-w-[300px] h-[400px] transition-transform duration-500 ease-in-out"
                onClick={() => setSelectedMember(member)}
              >
                <div className="imgBox absolute inset-0 z-10 transition-all duration-500 ease-in-out group-hover:-translate-x-14 group-hover:-translate-y-14">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-[40px]"
                  />
                </div>
                <div className="team-content absolute inset-0 bg-white flex justify-center items-end text-center p-6 z-0 transition-all duration-500 ease-in-out group-hover:translate-x-14 group-hover:translate-y-14 rounded-[40px] shadow-md">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 leading-tight">{member.name}</h2>
                    <span className="text-gray-500 text-sm">{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section with Rounded Counters */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Impact
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { count: 2, label: 'Projects', href: '/projects' },
              { count: 5, label: 'Partners' },
              { count: 30, label: 'Volunteers' },
              { count: 1, label: 'Awards' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-white h-32 w-32 sm:h-40 sm:w-40 rounded-full shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <span className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{item.count}</span>
                {item.href ? (
                  <Link href={item.href} className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300">
                    {item.label}
                  </Link>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">{item.label}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white p-6 sm:p-8 rounded-xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="text-center space-y-4">
              <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden">
                <Image src={selectedMember.image} alt={selectedMember.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">{selectedMember.name}</h2>
              <p className="text-gray-600 text-sm">{selectedMember.role}</p>
              <p className="text-gray-700 text-base">{selectedMember.bio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        .team-box {
          cursor: pointer;
        }
        .team-box:hover .imgBox {
          transform: translate(-3.5rem, -3.5rem);
        }
        .team-box:hover .team-content {
          transform: translate(3.5rem, 3.5rem);
        }
        @media (max-width: 600px) {
          .team-box:hover .imgBox {
            transform: translate(0, -3.5rem);
          }
          .team-box:hover .team-content {
            transform: translate(0, 3.5rem);
          }
        }
      `}</style>
    </main>
  );
}