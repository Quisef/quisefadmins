'use client'; // Required for client-side interactivity

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const slides = [
  {
    image: '/images/deso.jpg',
    title: 'Provide Shelter',
    span: 'To The Distress',
    link: '/blog',
    linkText: 'Read More',
  },
  {
    image: '/images/vine.jpg',
    title: 'Achieve',
    span: 'Food Security For All',
    link: '/about',
    linkText: 'Our Story',
  },
  {
    image: '/images/youth_empowerment_africa.jpeg',
    title: 'We Empower',
    span: 'The Youths',
    link: '/blog',
    linkText: 'Blog',
  },
  {
    image: '/images/vision.jpg',
    title: 'Develop Novel Solutions',
    span: 'For Societal Issues',
    link: '/gallery',
    linkText: 'Gallery',
  },
  {
    image: '/images/kids2.jpg',
    title: 'Source Funding',
    span: 'To Save Lives',
    link: '/donation',
    linkText: 'Donate',
  },
];

const Slider: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Automatic sliding
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Handle manual navigation
  const handleNavClick = (index: number) => {
    setActiveSlide(index);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === activeSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
          <div
            className={`absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              {slide.title} <br />
              <span className="text-white-400">{slide.span}</span>
            </h1>
            <Link
              href={slide.link}
              className="mt-6 inline-block bg-yellow-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              {slide.linkText}
            </Link>
          </div>
        </div>
      ))}

      {/* Social Media Icons */}
      <div className="absolute bottom-16 left-4 md:left-8 flex space-x-4">
        <a href="https://www.facebook.com/quietshelterfoundation" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebookF} className="text-xl text-white hover:text-blue-400" />
        </a>
        <a href="https://www.instagram.com/quietshelterfoundation" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} className="text-xl text-white hover:text-blue-400" />
        </a>
        <a href="https://ng.linkedin.com/in/quite-shelter-empowerment-foundation-3a85a3312" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedinIn} className="text-xl text-white hover:text-blue-400" />
        </a>
      </div>

      {/* Slider Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleNavClick(index)}
            className={`w-3 h-3 rounded-full ${
              index === activeSlide ? 'bg-blue-500' : 'bg-gray-400'
            } hover:bg-blue-600 transition-colors`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Slider;