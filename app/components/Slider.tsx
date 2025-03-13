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
        <LoadingSpinner /> {/* Replace text with hovering logo */}
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
          <div className="absolute inset-0 bg-black/30 z-10" />
          <Image
            src={slide.imageUrl || '/placeholder.jpg'}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={index === 0}
            quality={90}
            style={{ objectFit: 'cover' }}
            className="brightness-75"
            onError={() => console.error(`Failed to load image: ${slide.imageUrl}`)}
          />
          <div
            className={`absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center p-4 sm:p-6 md:p-8 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 max-w-4xl">
              {slide.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 max-w-2xl">
              {slide.text}
            </p>
            {slide.link && (
              <a
                href={slide.link}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 hover:bg-blue-600 text-white text-sm sm:text-base py-2 px-6 rounded transition-colors duration-300"
              >
                {getButtonTextFromLink(slide.link)}
              </a>
            )}
          </div>
        </div>
      ))}

      {/* Social Media Links */}
      <div className="absolute bottom-12 sm:bottom-16 left-4 sm:left-8 z-30 flex space-x-4 sm:space-x-6">
        <a 
          href="https://www.facebook.com/quietshelterfoundation" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
          aria-label="Facebook"
        >
          <FontAwesomeIcon icon={faFacebookF} className="text-lg sm:text-xl text-white" />
        </a>
        <a 
          href="https://www.instagram.com/quietshelterfoundation" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors duration-300"
          aria-label="Instagram"
        >
          <FontAwesomeIcon icon={faInstagram} className="text-lg sm:text-xl text-white" />
        </a>
        <a 
          href="https://ng.linkedin.com/in/quite-shelter-empowerment-foundation-3a85a3312" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors duration-300"
          aria-label="LinkedIn"
        >
          <FontAwesomeIcon icon={faLinkedinIn} className="text-lg sm:text-xl text-white" />
        </a>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => handleNavClick(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === activeSlide 
                ? 'bg-blue-500 w-4 sm:w-5' 
                : 'bg-white/50 hover:bg-white/80'
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