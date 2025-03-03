import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Strategy - QuietShelter Empowerment Foundation',
  description: 'Explore QuietShelter Empowerment Foundation’s strategic approach to creating positive change in agriculture, climate, education, and more.',
  openGraph: {
    title: 'Our Strategy - QuietShelter Empowerment Foundation',
    description: 'Explore QuietShelter Empowerment Foundation’s strategic approach to creating positive change in agriculture, climate, education, and more.',
    url: 'https://your-domain.com/strategy',
    images: ['/images/Chama.jpg'],
  },
};

export default function StrategyPage() {
  return (
    <main className="bg-gray-50">
      {/* Showcase Section */}
      <section  className="relative min-h-screen flex items-center justify-center text-white px-6 text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/pic5.jpg')" }}>
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl text-white sm:text-5xl md:text-6xl font-bold mb-2 mt-72 leading-tight tracking-tight">
            Our Strategy
          </h1>
        </div>
      </section>

      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              <em>Executive Director</em>
            </h1>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              I am pleased to welcome you to Quiet Shelter Empowerment Foundation. On behalf of the work team, I invite you to explore the foundation’s platform. We created this platform to make it easier for you to be a part of the positive change we are creating for a better world to live in. With time fleeting and so much impact to be made, we are passionate about bringing hope alive for the vulnerable and disadvantaged members of our communities. This initiative really needs more ambassadors as we envision together a time when many lives are transformed.
            </p>
          </div>
          <div className="relative h-84 sm:h-80 lg:h-96 w-full rounded-[90px_10px_10px_10px] overflow-hidden ">
            <Image
              src="/images/Chama.jpg"
              alt="Executive Director Speech"
              fill
              style={{ objectFit: 'cover' }}
              className="absolute inset-0 w-full h-full  transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Our Strategic Framework Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Strategic Framework
          </h2>
          <div className="space-y-12">
            {/* Vision */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Vision</h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              A world of hope, tolerance and social justice where resources are equitably distributed and all people live in dignity and respect for one another.  
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Mission</h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              To build communities where the hope of the vulnerable and disadvantaged members is restored through the provision of essential needs like shelter, food, water, healthcare, and education and by empowering them with skills and resources through training, mentorship, and networking for better livelihoods.
              </p>
            </div>

            {/* Purpose */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Purpose</h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              The organization's purpose is to provide humanitarian services to communities, aiming to bring about positive changes and developments.
              </p>
            </div>

            {/* Core Values */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-center text-blue-600 mb-4">Core Values</h3>
              <ul className="list-disc list-inside  text-gray-700 space-y-2">
                <li>Excellence</li>
                <li>Transparency </li>
                <li>Respect </li>
                <li>Humanity </li>
                <li>Accountability </li>
              </ul>
            </div>

            {/* Strategic Pillars */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-center text-blue-600 mb-4">Strategic Pillars</h3>
              <div className="space-y-6">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  Our strategy is built on five key pillars to guide our work and maximize impact:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">1. Community Empowerment</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Equipping communities with the tools, knowledge, and resources to achieve self-sufficiency.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">2. Environmental Sustainability</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Promoting eco-friendly practices to combat climate change and preserve natural resources.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">3. Education and Capacity Building</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Providing quality education and vocational training to foster long-term growth.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">4. Health and Well-being</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Improving access to healthcare, water, sanitation, and safe shelters for vulnerable populations.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">5. Advocacy and Partnerships</h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      Advocating for policy changes and collaborating with stakeholders to scale impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-gray-700 text-base md:text-lg mb-6">
                Join us in implementing this vision. Together, we can drive transformative change for communities worldwide.
              </p>
              <Link
                href="/donation"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg"
              >
                Support Our Strategy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thematic Areas Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Thematic Areas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: '/images/farmer.jpg',
                title: 'Agriculture and Food Security',
                description:
                  'Ensuring sustainable agricultural practices is vital for meeting the nutritional needs of current and future generations while safeguarding the environment.',
                href: '/strategy/agriculture',
              },
              {
                image: '/images/tree.jpg',
                title: 'Environment and Climate',
                description:
                  'Protecting the environment and addressing climate change are urgent global priorities, impacting human health, economies, and ecosystems worldwide.',
                href: '/strategy/climate',
              },
              {
                image: '/images/edu.jpeg',
                title: 'Education',
                description:
                  'Access to quality education, from early childhood through adulthood, is essential for building a more equitable and prosperous world.',
                href: '/strategy/education',
              },
              {
                image: '/images/gbv.jpeg',
                title: 'Sexual and Gender-Based Violence (SGBV)',
                description:
                  'Addressing SGBV requires comprehensive strategies involving legal, social, and cultural interventions.',
                href: '/strategy/sgbv',
              },
              {
                image: '/images/waterboy.jpg',
                title: 'Water, Sanitation, and Hygiene (WASH)',
                description:
                  'Improving WASH infrastructure and practices can prevent waterborne diseases, reduce mortality rates, and enhance overall quality of life.',
                href: '/strategy/wash',
              },
              {
                image: '/images/hone.jpeg',
                title: 'Shelter and Infrastructure',
                description:
                  'Developing resilient shelters and rebuilding infrastructure supports livelihoods and economic activities, providing vulnerable populations with skills and resources for sustainable growth.',
                href: '/strategy/shelter',
              },
            ].map((area, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 sm:h-56 w-full">
                  <Image
                    src={area.image}
                    alt={area.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">{area.title}</h2>
                  <p className="text-gray-600 text-sm md:text-base line-clamp-3">{area.description}</p>
                  <Link
                    href={area.href}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:shadow-md"
                  >
                    See More
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