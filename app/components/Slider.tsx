'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Slide {
  id: string;
  imageUrl: string;
  title: string;
  text: string;
  link: string;
}

// Function to extract a human-readable title from a URL
const getButtonTextFromLink = (link: string): string => {
  try {
    let text = link.replace(/^(https?:\/\/)?(www\.)?/, '');
    text = text.split('/')[0];
    text = text.split('?')[0].split('#')[0];
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text || 'Visit Website';
  } catch (error) {
    return 'Visit Website';
  }
};

const Slider: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const slidesCollection = collection(db, 'slides');
        const slidesSnapshot = await getDocs(slidesCollection);
        const slidesList: Slide[] = slidesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Slide));
        
        setSlides(slidesList);
      } catch (error) {
        console.error('Error fetching slides:', error);
        setError('Failed to load slides. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const handleNavClick = (index: number): void => {
    setActiveSlide(index);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">No slides available</div>
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {slides.map((slide: Slide, index: number) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={index !== activeSlide}
        >
          {/* Enhanced overlay optimized for consistent image display */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70 z-10" />
          
          {/* Background image (blurred) to fill empty space */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={slide.imageUrl || '/placeholder.jpg'}
              alt=""
              fill
              sizes="100vw"
              priority={index === 0}
              quality={60}
              className="object-cover object-center blur-lg scale-180"
              onError={() => console.error(`Failed to load background image: ${slide.imageUrl}`)}
            />
          </div>
          
          {/* Main image container with fixed aspect ratio and centered display */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full max-w-none">
              <Image
                src={slide.imageUrl || '/placeholder.jpg'}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={85}
                className="object-contain object-center"
                style={{
                  aspectRatio: '16/9', // Force 16:9 aspect ratio (1920x1080)
                }}
                onError={() => console.error(`Failed to load image: ${slide.imageUrl}`)}
              />
            </div>
          </div>
          
          <div
            className={`absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end items-center text-white text-center p-4 sm:p-6 md:p-8 lg:p-12 pb-32 sm:pb-36 md:pb-40 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="max-w-7xl mx-auto rounded-2xl p-6 sm:p-8 md:p-10">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
                {slide.text}
              </p>
              {slide.link && (
                <a
                  href={slide.link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white text-sm sm:text-base md:text-lg font-semibold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  {getButtonTextFromLink(slide.link)}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Social Media Links */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-4 sm:left-6 md:left-8 z-30 flex space-x-3 sm:space-x-4 md:space-x-6">
        <a 
          href="https://www.facebook.com/quietshelterfoundation" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all duration-300 shadow-lg"
          aria-label="Facebook"
        >
          <FontAwesomeIcon icon={faFacebookF} className="text-lg sm:text-xl md:text-2xl text-white" />
        </a>
        <a 
          href="https://www.instagram.com/quietshelterfoundation" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600 hover:scale-110 transition-all duration-300 shadow-lg"
          aria-label="Instagram"
        >
          <FontAwesomeIcon icon={faInstagram} className="text-lg sm:text-xl md:text-2xl text-white" />
        </a>
        <a 
          href="https://ng.linkedin.com/in/quite-shelter-empowerment-foundation-3a85a3312" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-800 hover:scale-110 transition-all duration-300 shadow-lg"
          aria-label="LinkedIn"
        >
          <FontAwesomeIcon icon={faLinkedinIn} className="text-lg sm:text-xl md:text-2xl text-white" />
        </a>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3 md:space-x-4">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => handleNavClick(index)}
            className={`h-3 sm:h-4 md:h-5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
              index === activeSlide 
                ? 'bg-yellow-500 w-8 sm:w-10 md:w-12' 
                : 'bg-white/60 hover:bg-white/90 w-3 sm:w-4 md:w-5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  );
};

export default Slider;