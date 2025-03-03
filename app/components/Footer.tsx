'use client';

import { useState, useRef, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null); // Added ref for the form

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setResponseMessage(''); // Clear response message when closing
  };

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const formData = new FormData(e.currentTarget); // Safe to use synchronously
    const email = formData.get('email') as string;

    try {
      // Submit to Firestore 'subscribers' collection
      const docRef = await addDoc(collection(db, 'subscriptions'), {
        email,
        subscribedAt: serverTimestamp(), // Firebase timestamp for subscription time
      });
      console.log('Subscriber added with ID:', docRef.id);
      setResponseMessage('Subscribed successfully!');

      // Use the ref to reset the form
      if (formRef.current) {
        formRef.current.reset();
      } else {
        console.error('Form ref is not attached');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setResponseMessage('Error subscribing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Newsletter Banner */}
      <div className="bg-yellow-200 py-8 shadow-inner">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-2xl font-semibold tracking-tight text-black">Stay Connected</h3>
            <p className="text-black mt-1">Get the latest updates from QuietShelter</p>
          </div>
          <button
            onClick={openModal}
            className="bg-white text-black hover:bg-yellow-100 hover:shadow-lg py-3 px-8 rounded-full font-medium transition-all duration-300 ease-in-out"
          >
            Subscribe Now
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto py-16 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/Logo.png"
                alt="QuietShelter Logo"
                width={200}
                height={80}
                className="object-contain"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering communities and fostering sustainable change across Nigeria and beyond.
            </p>
            <div className="flex space-x-5">
              {[
                { href: 'https://www.facebook.com/quietshelterfoundation', icon: faFacebookF, hoverColor: 'hover:bg-blue-600' },
                { href: 'https://www.instagram.com/quietshelterfoundation', icon: faInstagram, hoverColor: 'hover:bg-pink-600' },
                { href: 'https://www.linkedin.com/in/quite-shelter-empowerment-foundation-3a85a3312', icon: faLinkedinIn, hoverColor: 'hover:bg-blue-800' },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-800 ${social.hoverColor} w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-300`}
                >
                  <FontAwesomeIcon icon={social.icon} size="lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-yellow-400 after:left-0 after:bottom-0 after:transition-all after:duration-300">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { href: '/about', label: 'Our Story' },
                { href: '/donation', label: 'Donation' },
                { href: '/career', label: 'Careers' },
                { href: '/contacts', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 flex items-center transition-colors duration-300"
                  >
                    <span className="mr-2 text-yellow-500">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-yellow-500 after:left-0 after:bottom-0 after:transition-all after:duration-300">
              Programs
            </h3>
            <ul className="space-y-4">
              {[
                { href: '/members', label: 'Membership' },
                { href: '/projects', label: 'Project' },
                { href: '/faq', label: 'FAQ' },
                { href: 'https://quisefadmin-mh9pz8j0y-tsojis-projects.vercel.app', label: 'Admin Portal', external: true },
              ].map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-yellow-400 flex items-center transition-colors duration-300"
                    >
                      <span className="mr-2 text-yellow-500">›</span>
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-yellow-400 flex items-center transition-colors duration-300"
                    >
                      <span className="mr-2 text-yellow-500">›</span>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-yellow-500 after:left-0 after:bottom-0 after:transition-all after:duration-300">
              Contact Us
            </h3>
            <ul className="space-y-6 text-gray-300">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-yellow-400 mt-1 mr-3" />
                <span className="text-sm leading-relaxed">
                  No 2A, Gibson Jalo Crescent, beside Government House Dougirei, Yola North, Adamawa State.
                </span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="text-yellow-400 mr-3" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-yellow-400 mr-3" />
                <span>info@quietshelter.org</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/donation'}
              className="mt-8 bg-yellow-300 hover:bg-yellow-600 text-white py-3 px-6 rounded-md font-medium w-full transition-all duration-300 hover:shadow-lg"
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 py-6 bg-gray-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2025 QuietShelter Empowerment Foundation | All Rights Reserved</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="hover:text-yellow-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-yellow-400 transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full p-1"
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
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Join Our Newsletter</h2>
              <p className="text-gray-600 mt-2">Stay informed about our mission and events</p>
            </div>
            <form ref={formRef} onSubmit={handleSubscribe} className="space-y-6">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="w-full p-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 placeholder-gray-400 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-md font-medium transition-all duration-300 hover:shadow-md ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
              {responseMessage && (
                <p
                  className={`text-sm text-center ${
                    responseMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {responseMessage}
                </p>
              )}
              <p className="text-xs text-gray-500 text-center">
                By subscribing, you agree to our{' '}
                <Link href="/privacy-policy" className="text-yellow-600 hover:underline">
                  Privacy Policy
                </Link>{' '}
                and consent to receive updates.
              </p>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;